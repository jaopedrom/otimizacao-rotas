/*
  Warnings:

  - A unique constraint covering the columns `[usr_cpf]` on the table `tb_usuario` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `usr_cpf` to the `tb_usuario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tb_usuario" ADD COLUMN     "usr_cpf" VARCHAR(11) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "tb_usuario_usr_cpf_key" ON "tb_usuario"("usr_cpf");
