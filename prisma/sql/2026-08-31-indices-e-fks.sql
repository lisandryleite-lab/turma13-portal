-- CreateIndex
CREATE INDEX "EscalaAluno_userId_idx" ON "EscalaAluno"("userId");

-- CreateIndex
CREATE INDEX "EscalaAluno_data_idx" ON "EscalaAluno"("data");

-- CreateIndex
CREATE INDEX "EscalaTurmaFaxina_userId_idx" ON "EscalaTurmaFaxina"("userId");

-- CreateIndex
CREATE INDEX "EscalaTurmaFaxina_data_idx" ON "EscalaTurmaFaxina"("data");

-- CreateIndex
CREATE INDEX "EscalaTurmaServico_userId_idx" ON "EscalaTurmaServico"("userId");

-- CreateIndex
CREATE INDEX "EscalaTurmaServico_data_idx" ON "EscalaTurmaServico"("data");

-- CreateIndex
CREATE INDEX "HistoricoNota_notaId_idx" ON "HistoricoNota"("notaId");

-- CreateIndex
CREATE INDEX "HistoricoNota_alteradoPorId_idx" ON "HistoricoNota"("alteradoPorId");

-- CreateIndex
CREATE INDEX "HistoricoNotaCFO_notaCfoId_idx" ON "HistoricoNotaCFO"("notaCfoId");

-- CreateIndex
CREATE INDEX "HistoricoNotaCFO_alteradoPorId_idx" ON "HistoricoNotaCFO"("alteradoPorId");

-- CreateIndex
CREATE INDEX "LogAcesso_area_timestamp_idx" ON "LogAcesso"("area", "timestamp");

-- CreateIndex
CREATE INDEX "MissaoConcluida_userId_idx" ON "MissaoConcluida"("userId");

-- CreateIndex
CREATE INDEX "Nota_userId_idx" ON "Nota"("userId");

-- CreateIndex
CREATE INDEX "Nota_disciplina_idx" ON "Nota"("disciplina");

-- CreateIndex
CREATE INDEX "User_turma_idx" ON "User"("turma");

-- AddForeignKey
ALTER TABLE "EscalaTurmaFaxina" ADD CONSTRAINT "EscalaTurmaFaxina_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EscalaTurmaServico" ADD CONSTRAINT "EscalaTurmaServico_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

