const { Client } = require("pg");

const missing = ["DATABASE_URL", "POSTGRES_DB", "MARTIN_USER", "MARTIN_PASSWORD"].filter(
  (name) => !process.env[name],
);

if (missing.length > 0) {
  console.error(
    "Missing environment variables:\n" +
      missing.map((name) => `- ${name}`).join("\n"),
  );

  process.exit(1);
}

const databaseUrl = process.env.DATABASE_URL;
const dbName = process.env.POSTGRES_DB;
const user = process.env.MARTIN_USER;
const password = process.env.MARTIN_PASSWORD;

const client = new Client({
  connectionString: databaseUrl,
});

async function main() {
  await client.connect();

  try {
    // Verifica se o usuário do Martin já existe, e cria se não existir
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT
          FROM pg_catalog.pg_roles
          WHERE rolname = '${user}'
        ) THEN
          CREATE ROLE ${user} LOGIN PASSWORD '${password}';
        END IF;
      END
      $$
    `);

    // Dá permissão ao usuário de se conectar ao banco de dados
    await client.query(`
      GRANT CONNECT ON DATABASE ${dbName} TO ${user};
    `);

    // Dá permissão ao usuário para referenciar os objetos dentro do esquema public
    await client.query(`
      GRANT USAGE ON SCHEMA public TO ${user};
    `);

    // Cria a função que o Martin usará para receber os dados da tabela de trilhas
    await client.query(`
      CREATE OR REPLACE FUNCTION trails_map_layer(z integer, x integer, y integer, query_params json)
      RETURNS bytea AS $$
      DECLARE
        v_grid_size float := 360.0 / power(2, z + 3);
        v_envelope_3857 geometry := ST_TileEnvelope(z, x, y);
        v_envelope_4326 geometry := ST_Transform(v_envelope_3857, 4326);
        v_min_length float := (query_params->>'min_length')::float;
        v_max_length float := (query_params->>'max_length')::float;
        v_min_duration float := (query_params->>'min_duration')::float;
        v_max_duration float := (query_params->>'max_duration')::float;
        v_difficulty integer := (query_params->>'difficulty')::integer;
      BEGIN
        RETURN ST_AsMVT(tile, 'trails_map_layer') FROM (
          SELECT
            min(id) as id,
            ST_AsMVTGeom(
              ST_Transform(ST_Centroid(ST_Collect(coordinates)), 3857),
              v_envelope_3857,
              4096,
              64,
              true
            ) as coordinates,
            count(*) as trail_count,
            
            CASE WHEN count(*) = 1 THEN min("publicId") ELSE NULL END as "publicId",
            CASE WHEN count(*) = 1 THEN min(name) ELSE NULL END as name
          
          FROM "Trail"
          WHERE coordinates && v_envelope_4326
            AND (v_min_length IS NULL OR "length" >= v_min_length)
            AND (v_max_length IS NULL OR "length" <= v_max_length)
            AND (v_min_duration IS NULL OR "duration" >= v_min_duration)
            AND (v_max_duration IS NULL OR "duration" <= v_max_duration)
      AND (v_difficulty IS NULL OR (
        v_difficulty = 1 AND COALESCE(FLOOR("difficultySum" / NULLIF("reviewCount", 0) / 2), 0.0)::integer <= 1
      ) OR (
        v_difficulty = 4 AND COALESCE(FLOOR("difficultySum" / NULLIF("reviewCount", 0) / 2), 0.0)::integer >= 4
      ) OR (
        COALESCE(FLOOR("difficultySum" / NULLIF("reviewCount", 0) / 2), 0.0)::integer = v_difficulty
      ))
          GROUP BY ST_SnapToGrid(coordinates, v_grid_size)
        ) AS tile;
      END;
      $$ LANGUAGE plpgsql
      IMMUTABLE 
      STRICT
      SECURITY DEFINER;
    `);

    // Dá permissão ao usuário para executar a função sql criada
    await client.query(`
      REVOKE EXECUTE ON FUNCTION trails_map_layer(integer, integer, integer, json) FROM PUBLIC;
    `);
    await client.query(`
      GRANT EXECUTE ON FUNCTION trails_map_layer(integer, integer, integer, json) TO ${user};
    `);
    
    await client.query("COMMIT");

    console.log("Successfully created and granted permissions to Martin user");
  } catch (error) {
    await client.query("ROLLBACK");

    throw error;
  } finally {
    await client.end();
  }
}

main();
