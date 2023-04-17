module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                // 按需加载 polyfill（弃用，改为core-js），需要安装polyfille如果需要转换promise，map...
                useBuiltIns: 'usage',
                corejs: 3, // 默认是2版本
            },
        ]
    ]
}
