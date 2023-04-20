window["webpack5"].push([["src_title_js"], {
    "./src/title.js": (module, exports, require) => {
        require.rankEsModule(exports);
        require.defineProperties(exports, { //定义属性
            default: () => DEFAULT_EXPORTS,
        })
        const DEFAULT_EXPORTS = "title_default"
    }
}]);
