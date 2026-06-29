-- Cria um índice único baseado nos valores ordenados de id de usuário.
-- Assim, é impossível criar um (10, 20) se (20, 10) já existir, e vice-versa.
CREATE UNIQUE INDEX friendship_anti_reciprocal_idx 
ON "Friendship" (LEAST("requesterId", "receiverId"), GREATEST("requesterId", "receiverId"));