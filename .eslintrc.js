module.exports = {
	env: {
		es6: true,
		browser: true,
	},
	parser: '@typescript-eslint/parser',
	parserOptions: {
		sourceType: 'module',
		allowImportExportEverywhere: false,
	},
	plugins: ['@typescript-eslint'],
	rules: {
		// @typescript-eslint 插件的规则，详情见 https://typescript-eslint.io/rules/*
		// 定义之前不要使用
		'@typescript-eslint/no-use-before-define': 'warn',
		// 🔧 调用函数时，括号前的空格
		'@typescript-eslint/func-call-spacing': ['error', 'never'],
		// 🚫 禁止重复的类成员
		'@typescript-eslint/no-dupe-class-members': 'error',
		// 🔧 是否分号
		'@typescript-eslint/semi': ['error', 'always'],
		// ✅🔧 统一缩进
		'@typescript-eslint/indent': ['error', 'tab', {
			'ignoredNodes': ['TSUnionType'],
			SwitchCase: 1,
		}],
		// 🔧 禁止使用无意义的分号
		'@typescript-eslint/no-extra-semi': 'error',
		// 🔧 要求或禁止尾随逗号
		'@typescript-eslint/comma-dangle': ['warn', {
			'arrays': 'always-multiline',
			'objects': 'always-multiline',
			'imports': 'always-multiline',
			'exports': 'always-multiline',
			'functions': 'always-multiline',
			'enums': 'always-multiline',
			'generics': 'always-multiline',
			'tuples': 'always-multiline',
		}],
		// 🔧 逗号前后的空格
		'@typescript-eslint/comma-spacing': ['error', {
			before: false,
			after: true,
		}],

		// eslint 内置规则，详情见 `https://eslint.org/docs/latest/rules/*`
		strict: ['error', 'never'],
		// ✅🔧 多行注释
		'multiline-comment-style': 'off',

		'sort-imports': 'off',
		// ✅ 强制类方法使用this
		'class-methods-use-this': 'off',
		// 🔧 换行强制为 `\n`
		'linebreak-style': ['error', 'unix'],
		// 🔧 箭头函数尽可能不用大括号
		'arrow-body-style': ['error', 'as-needed'],
		// 🔧 箭头函数尽可能不用括号
		'arrow-parens': ['error', 'as-needed'],
		// ✅🔧🔧 在对象的打开大括号后和关闭大括号之前强制实施一致的换行符
		'object-curly-newline': 'off',
		// ✅🔧 强制执行箭头函数体的位置
		'implicit-arrow-linebreak': 'off',
		// ✅🔧 与运算符有关的换行
		'operator-linebreak': 'off',
		// ✅🔧 函数前空格
		'space-before-function-paren': 'off',
		// 🔧 使用解构写法，而不是传统的赋值
		'prefer-destructuring': 'error',
		// 🔗🔧 要求或禁止尾随逗号, 使用 @typescript-eslint 规则代替
		'comma-dangle': ['off', {
			'arrays': 'always-multiline',
			'objects': 'always-multiline',
			'imports': 'always-multiline',
			'exports': 'always-multiline',
			'functions': 'always-multiline',
		}],
		// 🔗🔧 逗号前后的空格, 使用 @typescript-eslint 规则代替
		'comma-spacing': ['off', { before: false, after: true }],
		// 🔧 控制逗号在行尾出现还是在行首出现 (默认行尾)
		'comma-style': ['error', 'last'],
		// 🔗🔧 统一缩进, 使用 @typescript-eslint 规则代替
		'indent': ['off', 'tab', { SwitchCase: 1 }],
		// 🔧 jsx 双引号
		'jsx-quotes': ['error', 'prefer-double'],
		// 🔧 单引号
		quotes: ['error', 'single', {
			avoidEscape: true,
			allowTemplateLiterals: true,
		}],
		// 🔧 if while 等的子语句是否使用大括号
		curly: ['error', 'all'],
		// 🔧 优先使用 a.key 的形式，而不是 a['key'] 的形式
		'dot-notation': ['error', { 'allowKeywords': true }],
		// 🔧 文件尾随换行符
		'eol-last': ['error', 'always'],
		// 🔧 分号前后的空格
		'semi-spacing': ['error', { before: false, after: true }],
		// 🔗🔧 是否分号, 使用 @typescript-eslint 规则代替
		semi: ['off', 'always'],
		// 🔧 分号的位置
		'semi-style': ['error', 'last'],
		// 🚫 每行最大长度
		'max-len': ['warn', { code: 80, tabWidth: 2, ignoreComments: true }],
		// ⛔ 文件的最大行数
		'max-lines': ['warn', {
			max: 300,
			skipBlankLines: true,
			skipComments: true,
		}],
		// ⛔ 嵌套深度
		'max-depth': ['warn', { max: 5 }],
		// ⛔ 最大回调嵌套
		'max-nested-callbacks': ['warn', { max: 3 }],
		// ✅ 制表符
		'no-tabs': 'off',
		// 🚫 不允许直接调用 Object.prototype 上的方法
		'no-prototype-builtins': 'error',
		// 🚫 三元运算符嵌套
		'no-nested-ternary': 'error',
		// 🚫 条件语句中赋值
		'no-cond-assign': 'error',
		// 🔗 定义之前不要使用, 使用 @typescript-eslint 规则代替
		'no-use-before-define': 'off',
		// ⛔ 不能给参数赋值
		'no-param-reassign': 'warn',
		// 🚫 语法限制
		'no-restricted-syntax': ['error', 'WithStatement'],
		// ✅ 使用单纯的 continue
		'no-continue': 'off',
		// 🚫 返回语句中使用赋值
		'no-return-assign': ['error', 'except-parens'],
		// ✅ 箭头函数
		'no-confusing-arrow': 'off',
		// ✅ 自加自减
		'no-plusplus': 'off',
		// 🔧 禁止使用无意义的标签
		'no-extra-label': 'error',
		// 🔗🔧 禁止使用无意义的分号, 使用 @typescript-eslint 规则代替
		'no-extra-semi': 'off',
		// 🔧 禁止使用无意义的 bind
		'no-extra-bind': 'error',
		// 🔧 禁止 if 语句中有 return 之后有 else
		'no-else-return': 'error',
		// 🚫 禁止使用 eval
		'no-eval': 'error',
		// 🔧 空行不能够超过2行
		'no-multiple-empty-lines': ['error', { max: 2 }],
		// 🚫 禁止对一些关键字或者保留字进行赋值操作，比如NaN、Infinity、undefined、eval、arguments等
		'no-shadow-restricted-names': 'error',
		// 🚫 不能与 -0 比较
		'no-compare-neg-zero': 'error',
		// 🚫 将类的声明视为常量
		'no-class-assign': 'error',
		// 🚫 禁止给常量赋值
		'no-const-assign': 'error',
		// 🚫 禁止使用 alert, confirm 和 prompt
		'no-alert': 'error',
		// 🚫 禁止使用 arguments.caller 和 arguments.callee
		'no-caller': 'error',
		// 🚫 switch-case: 中定义变量时，必须使用 块
		'no-case-declarations': 'error',
		// 🚫 禁止隐式使用 eval
		'no-implied-eval': 'error',
		// 🚫 禁止使用标签
		'no-labels': 'error',
		// 🚫 禁止为全局常量赋值
		'no-global-assign': 'error',
		// 🚫 禁止使用较短的符号进行类型转换
		'no-implicit-coercion': 'error',
		// 🚫 禁止使用无意义的嵌套
		'no-lone-blocks': 'error',
		// 🚫 禁止创建原始类型对应类的实例
		'no-new-wrappers': 'error',
		// 🚫 禁止对 Symbol 使用 new
		'no-new-symbol': 'error',
		// 🚫 禁止 es5 中的八进制数字格式
		'no-octal': 'error',
		// 🚫 禁止 es5 中的八进制数字格式的字符编码
		'no-octal-escape': 'error',
		// 🚫 禁止使用 __proto__ 属性
		'no-proto': 'error',
		// 🚫 禁止一般的返回语句中使用 await
		'no-return-await': 'error',
		// 🚫 禁止使用 JavaScript: url
		'no-script-url': 'error',
		// 🚫 限制 throw 的值
		'no-throw-literal': 'error',
		// 🚫 禁止绝对的死循环
		'no-unmodified-loop-condition': 'error',
		// 🚫 禁止无用的表达式
		'no-unused-expressions': 'error',
		// 🚫 禁止不必要的 call 及 apply
		'no-useless-call': 'error',
		// 🚫 禁止不必要的 catch
		'no-useless-catch': 'error',
		// 🚫 禁止不必要的字符串连接
		'no-useless-concat': 'error',
		// 🚫 禁止不必要的转义字符
		'no-useless-escape': 'error',
		// 🚫 禁止不必要的 constructor
		'no-useless-constructor': 'error',
		// 🔧 禁止不必要的重命名
		'no-useless-rename': 'error',
		// 🚫 禁止使用 with
		'no-with': 'error',
		// 🚫 禁止使用 delete 删除变量
		'no-delete-var': 'error',
		// 🔗 禁止重复的类成员, 使用 @typescript-eslint 规则代替
		'no-dupe-class-members': 'off',
		// 🚫 对于继承的类的构造函数，必须在使用 this 前调用 super()
		'no-this-before-super': 'error',
		// 🔧 禁止将if语句作为 else 块中的唯一语句
		'no-lonely-if': 'error',
		// 🔧 禁止行尾空格
		'no-trailing-spaces': 'error',
		// 🔧 禁止属性名前的空格
		'no-whitespace-before-property': 'error',
		// 🔧 禁止或强制在单行代码块中使用空格
		'block-spacing': ['error', 'always'],
		// 🚫 构造函数首字母大写
		'new-cap': ['error', { newIsCap: true, capIsNew: false }],
		// 🔧 换行风格
		'linebreak-style': ['error', 'unix'],
		// 🚫 getter 必须有返回值
		'getter-return': 'error',
		// 🔧 箭头函数函数体简写
		'arrow-body-style': ['error', 'as-needed'],
		// 🔧 强制执行或禁止注释首字母大写
		'capitalized-comments': 'off',
		// 🔧 箭头函数参数简写
		'arrow-parens': ['error', 'as-needed'],
		// 🔧 constructor 中的 super
		'constructor-super': 'error',
		// 🚫 强制使用 === 及 !==
		eqeqeq: 'error',
		// 🚫 限制 Promise 的 reject 的值
		'prefer-promise-reject-errors': 'error',
		// 🔧 创建对象的简写格式
		'object-shorthand': ['error', 'always'],
		// 🔧 生成器的 * 的前后空格
		'generator-star-spacing': ['error', {
			before: false,
			after: true,
			anonymous: 'after',
			method: 'neither',
		}],
		// 🚫 使用扩展语法，而不是 apply
		'prefer-spread': 'error',
		// 🔧 使用字符串模板，而不是字符串拼接
		'prefer-template': 'error',
		// 🚫 生成器函数应当使用 yield 关键字
		'require-yield': 'error',
		// 🔧 rest、spread运算符与其表达式之间禁止留有空格
		'rest-spread-spacing': ['error', 'never'],
		// 🔧 模板字符串括号前后的空格
		'template-curly-spacing': ['error', 'never'],
		// 🔧 yield 后 * 前后的空格
		'yield-star-spacing': ['error', 'after'],
		// 🔧 计算键名的空格
		'computed-property-spacing': ['error', 'never'],
		// 🔗 调用函数时，括号前的空格, 使用 @typescript-eslint 规则代替
		'func-call-spacing': ['off', 'never'],
		// ✅🔧 定义函数时的参数间的换行
		'function-paren-newline': ['off', 'consistent'],
		// 🔧 关键字前后的空格
		'keyword-spacing': ['error'],
		// 🚫 注释的位置
		'line-comment-position': ['error', { position: 'above' }],
		// 🔧 链式调用时，每行的最大调用数量
		'newline-per-chained-call': ['error', { ignoreChainWithDepth: 3 }],
		// 🔧 强制赋值运算符简写
		'operator-assignment': ['error', 'always'],
	},
};
