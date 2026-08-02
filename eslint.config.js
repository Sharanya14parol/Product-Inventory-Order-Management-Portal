const js = require("@eslint/js");

module.exports = [
    {
        files: ["webapp/**/*.js"],

        ignores: [
            "webapp/test/**",
            "webapp/Component-preload.js"
        ],

        languageOptions: {
            ecmaVersion: 2021,
            sourceType: "script",

            globals: {
                sap: "readonly",
                console: "readonly"
            }
        },

        rules: {
            ...js.configs.recommended.rules,

            "no-unused-vars": [
                "warn",
                {
                    args: "none",
                    varsIgnorePattern: "^_"
                }
            ],

            "no-undef": "error",

            "no-console": "off",

            "semi": ["error", "always"],

            "quotes": [
                "error",
                "double"
            ],

            "indent": [
                "error",
                4,
                {
                    SwitchCase: 1
                }
            ],

            "eqeqeq": [
                "error",
                "always"
            ],

            "curly": [
                "error",
                "all"
            ]
        }
    }
];