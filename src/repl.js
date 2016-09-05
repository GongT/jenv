const repl = require('repl');

repl.start({
	useGlobal: true,
	ignoreUndefined: false,
	replMode: repl.REPL_MODE_MAGIC,
	breakEvalOnSigint: true,
	prompt: '> '
});
