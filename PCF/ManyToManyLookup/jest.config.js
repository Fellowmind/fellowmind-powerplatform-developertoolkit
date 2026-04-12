module.exports = {
    testEnvironment: 'jsdom',
    roots: ['<rootDir>/ManyToManyLookup'],
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {
            tsconfig: {
                jsx: 'react',
                esModuleInterop: true,
                module: 'commonjs',
                lib: ['dom', 'dom.iterable', 'es2017'],
                typeRoots: ['node_modules/@types'],
            },
        }],
    },
};
