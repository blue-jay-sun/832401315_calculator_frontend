# JavaScript 代码规范

来源：[Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html)。

- JavaScript 使用两空格缩进、分号、单引号；默认 const，需要重新赋值时使用 let。
- 变量和函数采用 camelCase，命名体现用途。
- 使用 async/await 处理请求，并处理失败、超时及重复提交。
- 使用 textContent 创建用户内容，不将表达式注入 innerHTML。
- 前端只处理交互和展示；不实现数学求值，不上传前端计算的结果。
- HTML 控件提供标签，反馈使用 aria-live，布局适应移动端。
