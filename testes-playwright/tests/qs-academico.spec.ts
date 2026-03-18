import { test, expect } from '@playwright/test';

test.describe('QS Acadêmico — Testes do Sistema de Notas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://fenazu.github.io/02-TesteAutomatizado/');
    await expect(page).toHaveTitle(/QS Acadêmico/);
    await expect(page.locator('#secao-cadastro')).toBeVisible();
  });

  // ========== GRUPO 1: Cadastro de Alunos ==========

  test.describe('Cadastro de Alunos', () => {

    test('deve cadastrar um aluno com dados válidos', async ({ page }) => {
      await expect(page.getByLabel('Nome do Aluno')).toHaveAttribute('placeholder', 'Digite o nome completo');
      await page.getByLabel('Nome do Aluno').fill('João Silva');
      await page.getByLabel('Nota 1').fill('7');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('6');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Verificar que o aluno aparece na tabela
      await expect(page.locator('#tabela-alunos tbody tr')).toHaveCount(1);
      await expect(page.locator('#tabela-alunos').getByText('João Silva')).toBeVisible();
    });

    test('deve exibir mensagem de sucesso após cadastro', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Ana Costa');
      await page.getByLabel('Nota 1').fill('9');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('10');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      await expect(page.locator('#mensagem')).toContainText('cadastrado com sucesso');
    });

    test('não deve cadastrar aluno sem nome', async ({ page }) => {
      await page.getByLabel('Nota 1').fill('7');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('6');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // A tabela deve continuar sem dados reais
      await expect(page.locator('#tabela-alunos').getByText('Nenhum aluno cadastrado.')).toBeVisible();
    });

  });

  // ========== GRUPO 2: Cálculo de Média ==========

  test.describe('Cálculo de Média', () => {

    test('deve calcular a média aritmética das três notas', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Pedro Santos');
      await page.getByLabel('Nota 1').fill('8');
      await page.getByLabel('Nota 2').fill('6');
      await page.getByLabel('Nota 3').fill('10');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Média esperada: (8 + 6 + 10) / 3 = 8.00
      const celulaMedia = page.locator('#tabela-alunos tbody tr').first().locator('td').nth(4);
      await expect(celulaMedia).toHaveText('8.00');
    });

  });

  // TESTES INCLUÍDOS CONFORME ROTEIRO A PARTIR DAQUI:

  // ========== GRUPO 3: Validação de Notas ==========

  test.describe('Validação de Notas', () => {

    test('deve rejeitar nota acima de 10', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Teste Nota Alta');
      await page.getByLabel('Nota 1').fill('11');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('7');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // O aluno NÃO deve ser cadastrado na tabela
      await expect(page.locator('#tabela-alunos').getByText('Nenhum aluno cadastrado.')).toBeVisible();

      // Deve exibir mensagem de erro
      await expect(page.locator('#mensagem')).toBeVisible();
    });

    test('deve rejeitar nota negativa', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Teste Nota Negativa');
      await page.getByLabel('Nota 1').fill('8');
      await page.getByLabel('Nota 2').fill('-1');
      await page.getByLabel('Nota 3').fill('7');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // O aluno NÃO deve ser cadastrado na tabela
      await expect(page.locator('#tabela-alunos').getByText('Nenhum aluno cadastrado.')).toBeVisible();

      // Deve exibir mensagem de erro
      await expect(page.locator('#mensagem')).toBeVisible();
    });

    test('deve aceitar nota nos limites válidos (0 e 10)', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Teste Limites');
      await page.getByLabel('Nota 1').fill('0');
      await page.getByLabel('Nota 2').fill('10');
      await page.getByLabel('Nota 3').fill('5');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // O aluno DEVE ser cadastrado (limites são valores válidos)
      await expect(page.locator('#tabela-alunos tbody tr')).toHaveCount(1);
      await expect(page.locator('#tabela-alunos').getByText('Teste Limites')).toBeVisible();
    });

  });

  // ========== GRUPO 4: Busca por Nome ==========

  test.describe('Busca por Nome', () => {

    test.beforeEach(async ({ page }) => {
      // Cadastrar primeiro aluno
      await page.getByLabel('Nome do Aluno').fill('Ana Souza');
      await page.getByLabel('Nota 1').fill('8');
      await page.getByLabel('Nota 2').fill('7');
      await page.getByLabel('Nota 3').fill('9');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Cadastrar segundo aluno
      await page.getByLabel('Nome do Aluno').fill('Carlos Lima');
      await page.getByLabel('Nota 1').fill('5');
      await page.getByLabel('Nota 2').fill('4');
      await page.getByLabel('Nota 3').fill('6');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Garantir que os dois foram cadastrados antes de cada teste
      await expect(page.locator('#tabela-alunos tbody tr')).toHaveCount(2);
    });

    test('deve exibir apenas o aluno correspondente ao termo buscado', async ({ page }) => {
      await page.getByPlaceholder('Filtrar alunos...').fill('Ana');

      // Apenas "Ana Souza" deve estar visível
      await expect(page.locator('#tabela-alunos').getByText('Ana Souza')).toBeVisible();
      await expect(page.locator('#tabela-alunos').getByText('Carlos Lima')).not.toBeVisible();

      // A tabela deve exibir exatamente 1 linha
      await expect(page.locator('#tabela-alunos tbody tr:visible')).toHaveCount(1);
    });

    test('deve restaurar todos os alunos ao limpar o filtro', async ({ page }) => {
      await page.getByPlaceholder('Filtrar alunos...').fill('Ana');
      await expect(page.locator('#tabela-alunos tbody tr:visible')).toHaveCount(1);

      // Limpar o campo de busca
      await page.getByPlaceholder('Filtrar alunos...').clear();

      // Ambos os alunos devem reaparecer
      await expect(page.locator('#tabela-alunos tbody tr')).toHaveCount(2);
      await expect(page.locator('#tabela-alunos').getByText('Ana Souza')).toBeVisible();
      await expect(page.locator('#tabela-alunos').getByText('Carlos Lima')).toBeVisible();
    });

    test('deve ser insensível a maiúsculas e minúsculas', async ({ page }) => {
      await page.getByPlaceholder('Filtrar alunos...').fill('ana');

      await expect(page.locator('#tabela-alunos').getByText('Ana Souza')).toBeVisible();
      await expect(page.locator('#tabela-alunos').getByText('Carlos Lima')).not.toBeVisible();
    });

    test('deve exibir mensagem de nenhum resultado para busca inexistente', async ({ page }) => {
      await page.getByPlaceholder('Filtrar alunos...').fill('Zzzzzz');

      await expect(page.locator('#tabela-alunos').getByText('Nenhum aluno cadastrado.')).toBeVisible();
      await expect(page.locator('#tabela-alunos').getByText('Ana Souza')).not.toBeVisible();
      await expect(page.locator('#tabela-alunos').getByText('Carlos Lima')).not.toBeVisible();
    });

  });

  // ========== GRUPO 5: Exclusão de Alunos ==========

  test.describe('Exclusão de Alunos', () => {

    test('deve excluir o único aluno e deixar a tabela vazia', async ({ page }) => {
      // Cadastrar um aluno
      await page.getByLabel('Nome do Aluno').fill('Lucas Pereira');
      await page.getByLabel('Nota 1').fill('7');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('9');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Garantir que o aluno foi cadastrado
      await expect(page.locator('#tabela-alunos tbody tr')).toHaveCount(1);
      await expect(page.locator('#tabela-alunos').getByText('Lucas Pereira')).toBeVisible();

      // Excluir o aluno
      await page.locator('#tabela-alunos tbody tr').first().getByRole('button', { name: 'Excluir' }).click();

      // A tabela deve exibir o placeholder de vazia
      await expect(page.locator('#tabela-alunos').getByText('Nenhum aluno cadastrado.')).toBeVisible();
      await expect(page.locator('#tabela-alunos').getByText('Lucas Pereira')).not.toBeVisible();
    });

    test('deve excluir apenas o aluno selecionado, mantendo os demais', async ({ page }) => {
      // Cadastrar dois alunos
      await page.getByLabel('Nome do Aluno').fill('Mariana Faria');
      await page.getByLabel('Nota 1').fill('9');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('10');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      await page.getByLabel('Nome do Aluno').fill('Roberto Alves');
      await page.getByLabel('Nota 1').fill('6');
      await page.getByLabel('Nota 2').fill('5');
      await page.getByLabel('Nota 3').fill('7');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      await expect(page.locator('#tabela-alunos tbody tr')).toHaveCount(2);

      // Excluir apenas o primeiro aluno (Mariana Faria)
      await page.locator('#tabela-alunos tbody tr').first().getByRole('button', { name: 'Excluir' }).click();

      // Apenas Roberto deve permanecer
      await expect(page.locator('#tabela-alunos tbody tr')).toHaveCount(1);
      await expect(page.locator('#tabela-alunos').getByText('Roberto Alves')).toBeVisible();
      await expect(page.locator('#tabela-alunos').getByText('Mariana Faria')).not.toBeVisible();
    });

    test('deve limpar todos os alunos com o botão "Limpar Tudo"', async ({ page }) => {
      // Cadastrar dois alunos
      await page.getByLabel('Nome do Aluno').fill('Fernanda Costa');
      await page.getByLabel('Nota 1').fill('8');
      await page.getByLabel('Nota 2').fill('7');
      await page.getByLabel('Nota 3').fill('9');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      await page.getByLabel('Nome do Aluno').fill('Diego Martins');
      await page.getByLabel('Nota 1').fill('5');
      await page.getByLabel('Nota 2').fill('6');
      await page.getByLabel('Nota 3').fill('4');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      await expect(page.locator('#tabela-alunos tbody tr')).toHaveCount(2);

      // Aceitar o diálogo de confirmação antes de clicar
      page.on('dialog', async dialog => {
        await dialog.accept();
      });
      await page.getByRole('button', { name: 'Limpar Tudo' }).click();

      // A tabela deve estar completamente vazia
      await expect(page.locator('#tabela-alunos').getByText('Nenhum aluno cadastrado.')).toBeVisible();
      await expect(page.locator('#tabela-alunos').getByText('Fernanda Costa')).not.toBeVisible();
      await expect(page.locator('#tabela-alunos').getByText('Diego Martins')).not.toBeVisible();
    });

    test('não deve excluir nenhum aluno ao cancelar o "Limpar Tudo"', async ({ page }) => {
      // Cadastrar um aluno
      await page.getByLabel('Nome do Aluno').fill('Patrícia Nunes');
      await page.getByLabel('Nota 1').fill('7');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('6');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      await expect(page.locator('#tabela-alunos tbody tr')).toHaveCount(1);

      // Rejeitar o diálogo de confirmação (clicar "Cancelar")
      page.on('dialog', async dialog => {
        await dialog.dismiss();
      });
      await page.getByRole('button', { name: 'Limpar Tudo' }).click();

      // O aluno deve continuar na tabela
      await expect(page.locator('#tabela-alunos tbody tr')).toHaveCount(1);
      await expect(page.locator('#tabela-alunos').getByText('Patrícia Nunes')).toBeVisible();
    });

  });

  // ========== GRUPO 6: Estatísticas ==========

  test.describe('Estatísticas', () => {

    test.beforeEach(async ({ page }) => {
      // Aluno Aprovado — média: (8 + 7 + 9) / 3 = 8.00
      await page.getByLabel('Nome do Aluno').fill('Alice Aprovada');
      await page.getByLabel('Nota 1').fill('8');
      await page.getByLabel('Nota 2').fill('7');
      await page.getByLabel('Nota 3').fill('9');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Aluno em Recuperação — média: (5 + 6 + 5) / 3 = 5.33
      await page.getByLabel('Nome do Aluno').fill('Bruno Recuperação');
      await page.getByLabel('Nota 1').fill('5');
      await page.getByLabel('Nota 2').fill('6');
      await page.getByLabel('Nota 3').fill('5');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Aluno Reprovado — média: (2 + 3 + 1) / 3 = 2.00
      await page.getByLabel('Nome do Aluno').fill('Carla Reprovada');
      await page.getByLabel('Nota 1').fill('2');
      await page.getByLabel('Nota 2').fill('3');
      await page.getByLabel('Nota 3').fill('1');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Asserção de guarda — os três devem estar cadastrados antes de cada teste
      await expect(page.locator('#tabela-alunos tbody tr')).toHaveCount(3);
    });

    test('deve exibir o total geral de alunos cadastrados', async ({ page }) => {
      await expect(page.locator('#stat-total')).toHaveText('3');
    });

    test('deve contabilizar corretamente o total de Aprovados', async ({ page }) => {
      await expect(page.locator('#stat-aprovados')).toHaveText('1');
    });

    test('deve contabilizar corretamente o total em Recuperação', async ({ page }) => {
      await expect(page.locator('#stat-recuperacao')).toHaveText('1');
    });

    test('deve contabilizar corretamente o total de Reprovados', async ({ page }) => {
      await expect(page.locator('#stat-reprovados')).toHaveText('1');
    });

    test('deve atualizar os cards ao excluir um aluno', async ({ page }) => {
      // Excluir o aluno Aprovado (primeira linha)
      await page.locator('#tabela-alunos tbody tr').first().getByRole('button', { name: 'Excluir' }).click();

       // Aguarda a tabela atualizar antes de verificar os cards
      await expect(page.locator('#tabela-alunos tbody tr')).toHaveCount(2);

      await expect(page.locator('#stat-total')).toHaveText('2');
      await expect(page.locator('#stat-aprovados')).toHaveText('0');
      await expect(page.locator('#stat-recuperacao')).toHaveText('1');
      await expect(page.locator('#stat-reprovados')).toHaveText('1');
    });

    test('deve zerar todos os cards ao limpar a tabela', async ({ page }) => {
      page.on('dialog', async dialog => {
        await dialog.accept();
      });
      await page.getByRole('button', { name: 'Limpar Tudo' }).click();

      await expect(page.locator('#stat-total')).toHaveText('0');
      await expect(page.locator('#stat-aprovados')).toHaveText('0');
      await expect(page.locator('#stat-recuperacao')).toHaveText('0');
      await expect(page.locator('#stat-reprovados')).toHaveText('0');
    });

  });

  // ========== GRUPO 7: Situação — Aprovado ==========

  test.describe('Situação — Aprovado', () => {

    test('deve exibir "Aprovado" para média exatamente igual a 7 (limite inferior)', async ({ page }) => {
      // Média: (7 + 7 + 7) / 3 = 7.00 — fronteira exata do Aprovado
      await page.getByLabel('Nome do Aluno').fill('Aluno Fronteira Aprovado');
      await page.getByLabel('Nota 1').fill('7');
      await page.getByLabel('Nota 2').fill('7');
      await page.getByLabel('Nota 3').fill('7');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      const linha = page.locator('#tabela-alunos tbody tr').first();
      await expect(linha.locator('td').nth(4)).toHaveText('7.00');
      await expect(linha.getByText('Aprovado', { exact: true })).toBeVisible();
    });

    test('deve exibir "Aprovado" para média acima de 7', async ({ page }) => {
      // Média: (8 + 9 + 7) / 3 = 8.00
      await page.getByLabel('Nome do Aluno').fill('Aluno Bem Aprovado');
      await page.getByLabel('Nota 1').fill('8');
      await page.getByLabel('Nota 2').fill('9');
      await page.getByLabel('Nota 3').fill('7');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      const linha = page.locator('#tabela-alunos tbody tr').first();
      await expect(linha.locator('td').nth(4)).toHaveText('8.00');
      await expect(linha.getByText('Aprovado', { exact: true })).toBeVisible();
    });

    test('deve exibir "Aprovado" para média máxima possível (10)', async ({ page }) => {
      // Média: (10 + 10 + 10) / 3 = 10.00 — teto do intervalo
      await page.getByLabel('Nome do Aluno').fill('Aluno Nota Máxima');
      await page.getByLabel('Nota 1').fill('10');
      await page.getByLabel('Nota 2').fill('10');
      await page.getByLabel('Nota 3').fill('10');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      const linha = page.locator('#tabela-alunos tbody tr').first();
      await expect(linha.locator('td').nth(4)).toHaveText('10.00');
      await expect(linha.getByText('Aprovado', { exact: true })).toBeVisible();
    });

    test('não deve exibir "Aprovado" para média abaixo de 7 (fronteira inferior)', async ({ page }) => {
      // Média: (6 + 7 + 6) / 3 = 6.33 — imediatamente abaixo do Aprovado
      await page.getByLabel('Nome do Aluno').fill('Aluno Abaixo do Aprovado');
      await page.getByLabel('Nota 1').fill('6');
      await page.getByLabel('Nota 2').fill('7');
      await page.getByLabel('Nota 3').fill('6');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      const linha = page.locator('#tabela-alunos tbody tr').first();
      await expect(linha.getByText('Aprovado', { exact: true })).not.toBeVisible();
    });

  });

  // ========== GRUPO 8: Situação — Reprovado ==========

  test.describe('Situação — Reprovado', () => {

    test('deve exibir "Reprovado" para média exatamente igual a 4.99 (fronteira superior)', async ({ page }) => {
      // Média: (4 + 5 + 5) / 3 = 4.67 — imediatamente abaixo do limite de Recuperação
      await page.getByLabel('Nome do Aluno').fill('Aluno Fronteira Reprovado');
      await page.getByLabel('Nota 1').fill('4');
      await page.getByLabel('Nota 2').fill('5');
      await page.getByLabel('Nota 3').fill('5');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      const linha = page.locator('#tabela-alunos tbody tr').first();
      await expect(linha.locator('td').nth(4)).toHaveText('4.67');
      await expect(linha.getByText('Reprovado', { exact: true })).toBeVisible();
    });

    test('deve exibir "Reprovado" para média bem abaixo de 5', async ({ page }) => {
      // Média: (2 + 3 + 1) / 3 = 2.00
      await page.getByLabel('Nome do Aluno').fill('Aluno Muito Reprovado');
      await page.getByLabel('Nota 1').fill('2');
      await page.getByLabel('Nota 2').fill('3');
      await page.getByLabel('Nota 3').fill('1');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      const linha = page.locator('#tabela-alunos tbody tr').first();
      await expect(linha.locator('td').nth(4)).toHaveText('2.00');
      await expect(linha.getByText('Reprovado', { exact: true })).toBeVisible();
    });

    test('deve exibir "Reprovado" para média mínima possível (0)', async ({ page }) => {
      // Média: (0 + 0 + 0) / 3 = 0.00 — piso do intervalo
      await page.getByLabel('Nome do Aluno').fill('Aluno Nota Mínima');
      await page.getByLabel('Nota 1').fill('0');
      await page.getByLabel('Nota 2').fill('0');
      await page.getByLabel('Nota 3').fill('0');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      const linha = page.locator('#tabela-alunos tbody tr').first();
      await expect(linha.locator('td').nth(4)).toHaveText('0.00');
      await expect(linha.getByText('Reprovado', { exact: true })).toBeVisible();
    });

    test('não deve exibir "Reprovado" para média igual a 5 (fronteira com Recuperação)', async ({ page }) => {
      // Média: (5 + 5 + 5) / 3 = 5.00 — fronteira exata entre Reprovado e Recuperação
      await page.getByLabel('Nome do Aluno').fill('Aluno Fronteira Recuperação');
      await page.getByLabel('Nota 1').fill('5');
      await page.getByLabel('Nota 2').fill('5');
      await page.getByLabel('Nota 3').fill('5');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      const linha = page.locator('#tabela-alunos tbody tr').first();
      await expect(linha.locator('td').nth(4)).toHaveText('5.00');
      await expect(linha.getByText('Reprovado', { exact: true })).not.toBeVisible();
    });

  });

  // ========== GRUPO 9: Múltiplos Cadastros ==========

  test.describe('Múltiplos Cadastros', () => {

    test('deve exibir 3 linhas após cadastrar 3 alunos consecutivos', async ({ page }) => {
      // Primeiro aluno — Aprovado: média (8 + 9 + 7) / 3 = 8.00
      await page.getByLabel('Nome do Aluno').fill('Aluno Um');
      await page.getByLabel('Nota 1').fill('8');
      await page.getByLabel('Nota 2').fill('9');
      await page.getByLabel('Nota 3').fill('7');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Segundo aluno — Recuperação: média (5 + 6 + 5) / 3 = 5.33
      await page.getByLabel('Nome do Aluno').fill('Aluno Dois');
      await page.getByLabel('Nota 1').fill('5');
      await page.getByLabel('Nota 2').fill('6');
      await page.getByLabel('Nota 3').fill('5');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Terceiro aluno — Reprovado: média (2 + 3 + 1) / 3 = 2.00
      await page.getByLabel('Nome do Aluno').fill('Aluno Três');
      await page.getByLabel('Nota 1').fill('2');
      await page.getByLabel('Nota 2').fill('3');
      await page.getByLabel('Nota 3').fill('1');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // A tabela deve conter exatamente 3 linhas
      await expect(page.locator('#tabela-alunos tbody tr')).toHaveCount(3);
    });

    test('deve preservar os dados de cada aluno após cadastros consecutivos', async ({ page }) => {
      // Primeiro aluno
      await page.getByLabel('Nome do Aluno').fill('Beatriz Souza');
      await page.getByLabel('Nota 1').fill('9');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('10');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Segundo aluno
      await page.getByLabel('Nome do Aluno').fill('Eduardo Lima');
      await page.getByLabel('Nota 1').fill('5');
      await page.getByLabel('Nota 2').fill('4');
      await page.getByLabel('Nota 3').fill('6');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Terceiro aluno
      await page.getByLabel('Nome do Aluno').fill('Gabriela Matos');
      await page.getByLabel('Nota 1').fill('2');
      await page.getByLabel('Nota 2').fill('1');
      await page.getByLabel('Nota 3').fill('3');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Verificar que os três nomes estão visíveis simultaneamente
      await expect(page.locator('#tabela-alunos').getByText('Beatriz Souza')).toBeVisible();
      await expect(page.locator('#tabela-alunos').getByText('Eduardo Lima')).toBeVisible();
      await expect(page.locator('#tabela-alunos').getByText('Gabriela Matos')).toBeVisible();

      // Verificar as médias de cada aluno individualmente
      const linhas = page.locator('#tabela-alunos tbody tr');

      // Beatriz — média: (9 + 8 + 10) / 3 = 9.00
      await expect(linhas.nth(0).locator('td').nth(4)).toHaveText('9.00');

      // Eduardo — média: (5 + 4 + 6) / 3 = 5.00
      await expect(linhas.nth(1).locator('td').nth(4)).toHaveText('5.00');

      // Gabriela — média: (2 + 1 + 3) / 3 = 2.00
      await expect(linhas.nth(2).locator('td').nth(4)).toHaveText('2.00');
    });

    test('deve limpar o formulário após cada cadastro', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Primeiro Aluno');
      await page.getByLabel('Nota 1').fill('7');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('9');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // O formulário deve estar vazio após o cadastro
      await expect(page.getByLabel('Nome do Aluno')).toHaveValue('');
      await expect(page.getByLabel('Nota 1')).toHaveValue('');
      await expect(page.getByLabel('Nota 2')).toHaveValue('');
      await expect(page.getByLabel('Nota 3')).toHaveValue('');
    });

    test('deve manter a ordem de inserção dos alunos na tabela', async ({ page }) => {
      const alunos = ['Primeiro Silva', 'Segundo Santos', 'Terceiro Costa'];

      for (const nome of alunos) {
        await page.getByLabel('Nome do Aluno').fill(nome);
        await page.getByLabel('Nota 1').fill('7');
        await page.getByLabel('Nota 2').fill('8');
        await page.getByLabel('Nota 3').fill('9');
        await page.getByRole('button', { name: 'Cadastrar' }).click();
      }

      const linhas = page.locator('#tabela-alunos tbody tr');
      await expect(linhas).toHaveCount(3);

      // Verificar que a ordem de inserção foi preservada
      await expect(linhas.nth(0).getByRole('cell').first()).toHaveText('Primeiro Silva');
      await expect(linhas.nth(1).getByRole('cell').first()).toHaveText('Segundo Santos');
      await expect(linhas.nth(2).getByRole('cell').first()).toHaveText('Terceiro Costa');
    });

  });


  // ========== GRUPO 10: Situação — Recuperação ==========

  test.describe('Situação — Recuperação', () => {

    test('deve exibir "Recuperação" para média exatamente igual a 5 (fronteira inferior)', async ({ page }) => {
      // Média: (5 + 5 + 5) / 3 = 5.00 — fronteira exata entre Reprovado e Recuperação
      await page.getByLabel('Nome do Aluno').fill('Aluno Fronteira Inferior');
      await page.getByLabel('Nota 1').fill('5');
      await page.getByLabel('Nota 2').fill('5');
      await page.getByLabel('Nota 3').fill('5');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      const linha = page.locator('#tabela-alunos tbody tr').first();
      await expect(linha.locator('td').nth(4)).toHaveText('5.00');
      await expect(linha.getByText('Recuperação', { exact: true })).toBeVisible();
    });

    test('deve exibir "Recuperação" para média no meio do intervalo', async ({ page }) => {
      // Média: (6 + 5 + 7) / 3 = 6.00
      await page.getByLabel('Nome do Aluno').fill('Aluno Meio do Intervalo');
      await page.getByLabel('Nota 1').fill('6');
      await page.getByLabel('Nota 2').fill('5');
      await page.getByLabel('Nota 3').fill('7');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      const linha = page.locator('#tabela-alunos tbody tr').first();
      await expect(linha.locator('td').nth(4)).toHaveText('6.00');
      await expect(linha.getByText('Recuperação', { exact: true })).toBeVisible();
    });

    test('deve exibir "Recuperação" para média imediatamente abaixo de 7 (fronteira superior)', async ({ page }) => {
      // Média: (6 + 7 + 6) / 3 = 6.33 — imediatamente abaixo do limite de Aprovado
      await page.getByLabel('Nome do Aluno').fill('Aluno Fronteira Superior');
      await page.getByLabel('Nota 1').fill('6');
      await page.getByLabel('Nota 2').fill('7');
      await page.getByLabel('Nota 3').fill('6');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      const linha = page.locator('#tabela-alunos tbody tr').first();
      await expect(linha.locator('td').nth(4)).toHaveText('6.33');
      await expect(linha.getByText('Recuperação', { exact: true })).toBeVisible();
    });

    test('não deve exibir "Recuperação" para média igual a 7 (fronteira com Aprovado)', async ({ page }) => {
      // Média: (7 + 7 + 7) / 3 = 7.00 — fronteira exata entre Recuperação e Aprovado
      await page.getByLabel('Nome do Aluno').fill('Aluno Fronteira Aprovado');
      await page.getByLabel('Nota 1').fill('7');
      await page.getByLabel('Nota 2').fill('7');
      await page.getByLabel('Nota 3').fill('7');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      const linha = page.locator('#tabela-alunos tbody tr').first();
      await expect(linha.locator('td').nth(4)).toHaveText('7.00');
      await expect(linha.getByText('Recuperação', { exact: true })).not.toBeVisible();
    });

    test('não deve exibir "Recuperação" para média abaixo de 5 (fronteira com Reprovado)', async ({ page }) => {
      // Média: (3 + 5 + 4) / 3 = 4.00 — imediatamente abaixo do limite de Recuperação
      await page.getByLabel('Nome do Aluno').fill('Aluno Abaixo da Recuperação');
      await page.getByLabel('Nota 1').fill('3');
      await page.getByLabel('Nota 2').fill('5');
      await page.getByLabel('Nota 3').fill('4 ');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Aguarda a linha aparecer antes de verificar as células
      await expect(page.locator('#tabela-alunos tbody tr')).toHaveCount(1);

      const linha = page.locator('#tabela-alunos tbody tr').first();
      await expect(linha.locator('td').nth(4)).toHaveText('4.00');
      await expect(linha.getByText('Recuperação', { exact: true })).not.toBeVisible();
    });

  });



});