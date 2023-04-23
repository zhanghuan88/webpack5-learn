/**
 * 统一路径分隔符为 unix 风格
 * @param path
 * @returns {*}
 */
function toUnixPath(path) {
  return path.replace(/\\/g, '/');
}
exports.toUnixPath= toUnixPath
