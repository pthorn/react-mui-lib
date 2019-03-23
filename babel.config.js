module.exports = api => {
    const is_test = api.env('test');

    let targets;

    if (is_test) {
        // for jest (yarn test)
        targets = {
            node: 'current',
        };
    } else {
        // for production (yarn build)
        targets = "> 0.25%, not dead";
    }

    return {
        presets: [
            '@babel/preset-react',
            [
                '@babel/preset-env',
                {
                    targets: targets
                },
            ],
        ],
        plugins: [
            "@babel/plugin-proposal-class-properties"
        ]
    };
};
