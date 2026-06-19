import { prisma } from "database";

 export async function newTrail(
  name: string, 
  point: string, 
  description: string, 
  address: string, 
  distance: number, 
  duration: number
) {
    const trail = await prisma.create({
    data: {
      name,
      point,
      description,
      address,
      distance,
      duration,
    },
  });
}
/*pro cadastro de uma nova trilha você precisa primeiro fazer uma função que cria trilha no service.ts,
 essa função vai receber como parâmetros tudo que ela precisa pra criar uma trilha, e o controller newTrail vai chamar esse service passando os dados já validados
