/*
  Warnings:

  - You are about to drop the column `emp_telefone` on the `tb_empresa` table. All the data in the column will be lost.
  - You are about to drop the column `usr_tel_id` on the `tb_usuario` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[emp_cnpj,emp_email]` on the table `tb_empresa` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `emp_end_id` to the `tb_empresa` table without a default value. This is not possible if the table is not empty.
  - Made the column `vei_motorista_id` on table `tb_veiculo` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "tb_usuario" DROP CONSTRAINT "fk_usr_tel";

-- DropForeignKey
ALTER TABLE "tb_veiculo" DROP CONSTRAINT "fk_vei_motorista";

-- DropIndex
DROP INDEX "tb_empresa_emp_cnpj_emp_email_emp_telefone_key";

-- DropIndex
DROP INDEX "idx_usuario_end";

-- DropIndex
DROP INDEX "idx_usuario_tel";

-- AlterTable
ALTER TABLE "tb_empresa" DROP COLUMN "emp_telefone",
ADD COLUMN     "emp_end_id" UUID NOT NULL,
ADD COLUMN     "tb_endereco_postalEndp_id" UUID;

-- AlterTable
ALTER TABLE "tb_endereco" ADD COLUMN     "end_apelido" VARCHAR(50),
ADD COLUMN     "end_usr_id" UUID,
ADD COLUMN     "tb_usuarioUsr_id" UUID;

-- AlterTable
ALTER TABLE "tb_telefone" ADD COLUMN     "dt_criacao" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "tel_apelido" VARCHAR(50),
ADD COLUMN     "tel_empresa_id" UUID,
ADD COLUMN     "tel_usr_id" UUID;

-- AlterTable
ALTER TABLE "tb_usuario" DROP COLUMN "usr_tel_id",
ADD COLUMN     "usr_dt_nascimento" DATE;

-- AlterTable
ALTER TABLE "tb_veiculo" ALTER COLUMN "vei_motorista_id" SET NOT NULL;

-- CreateIndex
CREATE INDEX "idx_empresa_end" ON "tb_empresa"("emp_end_id");

-- CreateIndex
CREATE UNIQUE INDEX "tb_empresa_emp_cnpj_emp_email_key" ON "tb_empresa"("emp_cnpj", "emp_email");

-- CreateIndex
CREATE INDEX "idx_telefone_usuario" ON "tb_telefone"("tel_usr_id");

-- CreateIndex
CREATE INDEX "idx_telefone_empresa" ON "tb_telefone"("tel_empresa_id");

-- AddForeignKey
ALTER TABLE "tb_empresa" ADD CONSTRAINT "fk_empresa_end" FOREIGN KEY ("emp_end_id") REFERENCES "tb_endereco"("end_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tb_empresa" ADD CONSTRAINT "tb_empresa_tb_endereco_postalEndp_id_fkey" FOREIGN KEY ("tb_endereco_postalEndp_id") REFERENCES "tb_endereco_postal"("endp_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_endereco" ADD CONSTRAINT "tb_endereco_tb_usuarioUsr_id_fkey" FOREIGN KEY ("tb_usuarioUsr_id") REFERENCES "tb_usuario"("usr_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_telefone" ADD CONSTRAINT "fk_tel_usuario" FOREIGN KEY ("tel_usr_id") REFERENCES "tb_usuario"("usr_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tb_telefone" ADD CONSTRAINT "fk_tel_empresa" FOREIGN KEY ("tel_empresa_id") REFERENCES "tb_empresa"("empresa_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tb_veiculo" ADD CONSTRAINT "fk_vei_motorista" FOREIGN KEY ("vei_motorista_id") REFERENCES "tb_usuario"("usr_id") ON DELETE RESTRICT ON UPDATE NO ACTION;
