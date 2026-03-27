-- CreateTable
CREATE TABLE "produtos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codigo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "fornecedor" TEXT NOT NULL,
    "custoUnitario" REAL NOT NULL,
    "unidade" TEXT NOT NULL DEFAULT 'UN',
    "ncm" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "perfis_fiscais" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "icms" REAL NOT NULL DEFAULT 18.0,
    "pis" REAL NOT NULL DEFAULT 0.65,
    "cofins" REAL NOT NULL DEFAULT 3.0,
    "ipi" REAL NOT NULL DEFAULT 0.0,
    "icmsST" REAL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "padrao" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "configuracoes_operacionais" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "despesasOperacionais" REAL NOT NULL DEFAULT 8.0,
    "comissaoVendedor" REAL NOT NULL DEFAULT 3.0,
    "fretePercentual" REAL,
    "freteFixo" REAL,
    "margemLucroPadrao" REAL NOT NULL DEFAULT 15.0,
    "atualizadoEm" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "historico_calculos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "produtoId" TEXT,
    "produtoNome" TEXT NOT NULL,
    "produtoCodigo" TEXT NOT NULL,
    "perfilFiscalId" TEXT,
    "perfilFiscalNome" TEXT NOT NULL,
    "custoUnitario" REAL NOT NULL,
    "icms" REAL NOT NULL,
    "pis" REAL NOT NULL,
    "cofins" REAL NOT NULL,
    "ipi" REAL NOT NULL,
    "margemLucro" REAL NOT NULL,
    "comissaoVendedor" REAL NOT NULL,
    "despesasOperacionais" REAL NOT NULL,
    "fretePercentual" REAL,
    "freteFixo" REAL,
    "totalImpostos" REAL NOT NULL,
    "totalDespesas" REAL NOT NULL,
    "markupDivisor" REAL NOT NULL,
    "markupMultiplicador" REAL NOT NULL,
    "precoVenda" REAL NOT NULL,
    "lucroUnitario" REAL NOT NULL,
    "valorImpostos" REAL NOT NULL,
    "valorComissao" REAL NOT NULL,
    "valorDespesas" REAL NOT NULL,
    "valorFrete" REAL NOT NULL,
    "valorLucro" REAL NOT NULL,
    "observacao" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "historico_calculos_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produtos" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "historico_calculos_perfilFiscalId_fkey" FOREIGN KEY ("perfilFiscalId") REFERENCES "perfis_fiscais" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "produtos_codigo_key" ON "produtos"("codigo");
