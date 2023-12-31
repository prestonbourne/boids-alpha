# Delta

Prototyping with an interactive 3D sandbox that allows users to observe and manipulate artificial life.

## Quick start

Local development requires an installation of [Bun](https://bun.sh/)

1. Clone down the repo
2. To install the dependencies, Run `bun i` || `bun install`
3. To run locally run `bun dev`

## Resources

[Lightweight implementation](https://github.com/juanuys/boids)

### React + TypeScript + Vite Template

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
   parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
   },
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list

## Todo

### Camera slow pan after idle

```ts
if (slowPanEnabled) {
   this.userCamera.lookAt(light.position);
   this.userCamera.position.x = Math.sin(counter) * 500;
   this.userCamera.position.z = Math.cos(counter) * 500;
}

if (lure) {
   lure.position.x = Math.sin(counter * 5) * 400;
   lure.position.y = Math.cos(counter * 10) * 400;
   lure.position.z = Math.cos(counter * 15) * 400;
}
```
