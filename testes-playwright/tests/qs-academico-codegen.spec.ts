import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://fenazu.github.io/02-TesteAutomatizado/');
  await page.getByRole('textbox', { name: 'Nome do Aluno' }).click();
  await page.getByRole('textbox', { name: 'Nome do Aluno' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Nome do Aluno' }).fill('Ana ');
  await page.getByRole('textbox', { name: 'Nome do Aluno' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Nome do Aluno' }).fill('Ana Silva');
  await page.getByRole('spinbutton', { name: 'Nota 1' }).click();
  await page.getByRole('spinbutton', { name: 'Nota 1' }).fill('8');
  await page.getByRole('spinbutton', { name: 'Nota 2' }).click();
  await page.getByRole('spinbutton', { name: 'Nota 2' }).fill('7');
  await page.getByRole('spinbutton', { name: 'Nota 3' }).click();
  await page.getByRole('spinbutton', { name: 'Nota 3' }).fill('9');
  await page.getByRole('button', { name: 'Cadastrar' }).click();
  await page.getByRole('textbox', { name: 'Nome do Aluno' }).click();
  await page.getByRole('textbox', { name: 'Nome do Aluno' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Nome do Aluno' }).fill('Carlos ');
  await page.getByRole('textbox', { name: 'Nome do Aluno' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Nome do Aluno' }).fill('Carlos Lima');
  await page.getByRole('spinbutton', { name: 'Nota 1' }).click();
  await page.getByRole('spinbutton', { name: 'Nota 1' }).fill('5');
  await page.getByRole('spinbutton', { name: 'Nota 2' }).click();
  await page.getByRole('spinbutton', { name: 'Nota 2' }).fill('4');
  await page.getByRole('spinbutton', { name: 'Nota 3' }).click();
  await page.getByRole('spinbutton', { name: 'Nota 3' }).fill('6');
  await page.getByRole('button', { name: 'Cadastrar' }).click();
  await page.getByRole('textbox', { name: 'Buscar por nome' }).click();
  await page.getByRole('textbox', { name: 'Buscar por nome' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Buscar por nome' }).fill('Ana');
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'Limpar Tudo' }).click();
  await page.getByRole('textbox', { name: 'Buscar por nome' }).click();
  await page.getByRole('textbox', { name: 'Buscar por nome' }).fill('');
  await page.getByRole('textbox', { name: 'Buscar por nome' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Buscar por nome' }).fill('Ana');
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'Limpar Tudo' }).click();
  await page.getByRole('textbox', { name: 'Buscar por nome' }).click();
  await page.getByRole('textbox', { name: 'Buscar por nome' }).fill('');
});