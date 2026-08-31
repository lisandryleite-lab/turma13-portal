-- Rollback de 2026-08-31-indices-e-fks.sql (checkup: indices + FKs).
-- A migracao original e puramente aditiva; este script desfaz tudo.
ALTER TABLE "EscalaTurmaServico" DROP CONSTRAINT IF EXISTS "EscalaTurmaServico_userId_fkey";
ALTER TABLE "EscalaTurmaFaxina"  DROP CONSTRAINT IF EXISTS "EscalaTurmaFaxina_userId_fkey";

DROP INDEX IF EXISTS "User_turma_idx";
DROP INDEX IF EXISTS "Nota_disciplina_idx";
DROP INDEX IF EXISTS "Nota_userId_idx";
DROP INDEX IF EXISTS "MissaoConcluida_userId_idx";
DROP INDEX IF EXISTS "LogAcesso_area_timestamp_idx";
DROP INDEX IF EXISTS "HistoricoNotaCFO_alteradoPorId_idx";
DROP INDEX IF EXISTS "HistoricoNotaCFO_notaCfoId_idx";
DROP INDEX IF EXISTS "HistoricoNota_alteradoPorId_idx";
DROP INDEX IF EXISTS "HistoricoNota_notaId_idx";
DROP INDEX IF EXISTS "EscalaTurmaServico_data_idx";
DROP INDEX IF EXISTS "EscalaTurmaServico_userId_idx";
DROP INDEX IF EXISTS "EscalaTurmaFaxina_data_idx";
DROP INDEX IF EXISTS "EscalaTurmaFaxina_userId_idx";
DROP INDEX IF EXISTS "EscalaAluno_data_idx";
DROP INDEX IF EXISTS "EscalaAluno_userId_idx";
