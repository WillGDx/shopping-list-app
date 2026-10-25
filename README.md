# Shop Lista de Compras 🛒

Aplicativo de listas de compras para Android, desenvolvido com **React Native** e **Expo**. O objetivo é organizar compras de forma simples, com funcionamento offline e armazenamento local.

> **Status:** aplicativo em fase de testes. As funcionalidades descritas abaixo refletem o código do projeto e ainda estão passando por validação.

## Funcionalidades

- Criar e excluir listas de compras.
- Adicionar e excluir produtos de uma lista.
- Marcar produtos como comprados ou devolvê-los à lista de pendentes.
- Informar quantidade e preço ao adicionar um produto ao carrinho.
- Calcular o valor total dos produtos comprados (preço × quantidade).
- Exibir o número de **produtos diferentes** no carrinho, não a soma das unidades.
- Salvar listas e produtos localmente usando AsyncStorage, sem exigir internet ou conta de usuário.

## Tecnologias

- React Native
- Expo
- React Navigation
- AsyncStorage
- Expo Checkbox
- Lottie

## Como executar localmente

**Pré-requisitos:** Node.js, npm e um dispositivo Android com Expo Go ou um emulador compatível.

```bash
git clone https://github.com/WillGDx/shopping-list-app.git
cd shopping-list-app
npm install
npx expo start
```

Abra o projeto no Expo Go ou siga as instruções exibidas no terminal para executar no ambiente de desenvolvimento. A compatibilidade com Expo Go depende das versões do SDK e das bibliotecas instaladas.

## Organização do projeto

```text
shopping-list-app/
├── App.js                    # Navegação entre telas
├── screens/
│   ├── HomeScreen.js         # Criação e gerenciamento de listas
│   └── ListDetailScreen.js   # Produtos, carrinho e cálculo de valores
├── assets/                   # Ícones e animações
├── app.json                  # Configurações do Expo
└── package.json              # Dependências e scripts
```

## Armazenamento e privacidade

As listas e os produtos são armazenados **no próprio aparelho**, via AsyncStorage. Não há integração com Supabase nem sincronização entre dispositivos nesta versão. Desinstalar o aplicativo ou limpar seus dados pode apagar as listas salvas. AsyncStorage não é indicado para informações sensíveis.

## Testes e melhorias

O projeto ainda não possui um comando de testes automatizados configurado no `package.json`. Antes de disponibilizar uma nova versão, devem ser verificados especialmente:

- Persistência ao fechar e reabrir o aplicativo.
- Integridade dos dados durante o carregamento inicial.
- Inclusão e exclusão de listas e produtos.
- Validação de quantidade e preço.
- Cálculo do total e contagem de produtos no carrinho.
- Legibilidade dos campos de texto em diferentes configurações do Android.

As correções devem ser revisadas e testadas antes de serem integradas à branch `main`.

## Autor

Projeto desenvolvido por **Willian Guedes (WillCode)**.

---
Este README descreve a implementação atual e não representa uma garantia de que todos os testes já foram executados.
