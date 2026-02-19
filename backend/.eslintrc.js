module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.json',
    },
    plugins: ['@typescript-eslint'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-require-imports': 'off',
        'no-console': 'off',
    },
    env: {
        node: true,
        es2022: true,
        jest: true,
    },
    ignorePatterns: ['dist/', 'node_modules/', 'jest.config.js', '.eslintrc.js'],
    overrides: [
        {
            files: ['src/__tests__/**/*.ts', '**/*.test.ts', '**/*.spec.ts'],
            env: {
                jest: true,
            },
        },
    ],
};

