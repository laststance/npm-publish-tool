import chalk from 'chalk';

/**
 * Display utilities for rich terminal output
 */

export function logSuccess(message) {
  console.log(chalk.green('✅ ' + message));
}

export function logError(message) {
  console.log(chalk.red('❌ ' + message));
}

export function logWarning(message) {
  console.log(chalk.yellow('⚠️  ' + message));
}

export function logInfo(message) {
  console.log(chalk.blue('ℹ️  ' + message));
}

export function logStep(step, message) {
  console.log(chalk.cyan(`📋 Step ${step}: `) + chalk.white(message));
}

export function logHeader(title) {
  console.log('\n' + chalk.bold.magenta('🔧 ' + title));
  console.log(chalk.gray('─'.repeat(title.length + 4)));
}

export function logSeparator() {
  console.log(chalk.gray('─'.repeat(50)));
}

export function logCompletion() {
  console.log('\n' + chalk.bold.green('🎉 Setup completed successfully!'));
  console.log(chalk.green('Your project is now configured with release-it and GitHub Actions.'));
  console.log('\n' + chalk.yellow('Next steps:'));
  console.log(chalk.white('1. Configure your GitHub repository secrets (NPM_TOKEN, ACCESS_TOKEN)'));
  console.log(chalk.white('2. Make changes to your code'));
  console.log(chalk.white('3. Run: npm run release-commit'));
  console.log(chalk.white('4. Your release will be automatically created when pushed to main branch'));
}

export function logPackageManager(pmInfo) {
  console.log(chalk.cyan('📦 Detected package manager: ') + chalk.white(`${pmInfo.name} (${pmInfo.version})`));
}

export function logFileOperation(operation, file) {
  console.log(chalk.blue('📁 ' + operation + ': ') + chalk.white(file));
}

export function createProgressBar(total) {
  let current = 0;
  
  return {
    increment: () => {
      current++;
      const percentage = Math.round((current / total) * 100);
      const filled = Math.round(percentage / 5);
      const empty = 20 - filled;
      
      const bar = '█'.repeat(filled) + '░'.repeat(empty);
      process.stdout.write(`\r${chalk.cyan('Progress:')} [${chalk.green(bar)}] ${percentage}%`);
      
      if (current === total) {
        console.log(); // New line when complete
      }
    },
    
    complete: () => {
      current = total;
      const bar = '█'.repeat(20);
      console.log(`\r${chalk.cyan('Progress:')} [${chalk.green(bar)}] 100%`);
    }
  };
} 