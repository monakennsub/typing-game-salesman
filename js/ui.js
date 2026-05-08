/**
 * UI管理ファイル
 * 画面表示やUIの更新を管理
 */

const UI = {
    // 画面表示管理
    showScreen(screenId) {
        // すべての画面を非表示
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        // 指定画面を表示
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.add('active');
        }
    },

    // メイン画面表示
    showMainScreen() {
        this.showScreen('mainScreen');
    },

    // ステージ選択画面表示
    showStageSelectScreen() {
        this.showScreen('stageSelectScreen');
        this.updateCurrentStatus();
    },

    // ゲーム画面表示
    showGameScreen() {
        this.showScreen('gameScreen');
    },

    // クリア画面表示
    showClearScreen() {
        this.showScreen('clearScreen');
    },

    // ゲームオーバー画面表示
    showGameOverScreen() {
        this.showScreen('gameOverScreen');
    },

    // 設定画面表示
    showSettingsScreen() {
        this.showScreen('settingsScreen');
    },

    // 説明画面表示
    showAboutScreen() {
        this.showScreen('aboutScreen');
    },

    // ============================================
    // ゲーム画面のUI更新
    // ============================================

    // ステージ情報を更新
    updateStageInfo(stageId, stageName, enemyName) {
        document.getElementById('stageNumber').textContent = `Stage ${stageId}`;
        document.getElementById('enemyName').textContent = enemyName;
    },

    // プレイヤーステータスを更新
    updatePlayerStatus(salary, title) {
        document.getElementById('playerSalary').textContent = `¥${salary.toLocaleString()}`;
        document.getElementById('playerTitle').textContent = title;
    },

    // 敵情報を更新
    updateEnemyInfo(enemy) {
        document.getElementById('enemyImage').textContent = enemy.emoji;
        document.getElementById('enemyTitle').textContent = enemy.name;
        document.getElementById('enemyDescription').textContent = enemy.description;
        document.getElementById('maxHP').textContent = enemy.hp;
        this.updateEnemyHP(enemy.hp);
    },

    // 敵HPを更新
    updateEnemyHP(currentHP, maxHP = null) {
        const maxHPElement = document.getElementById('maxHP');
        const maxHPValue = maxHP || parseInt(maxHPElement.textContent);
        const percentage = Math.max(0, (currentHP / maxHPValue) * 100);

        document.getElementById('currentHP').textContent = Math.max(0, currentHP);
        document.getElementById('enemyHPBar').style.width = percentage + '%';

        // HPが低くなったら色を変更
        const hpBar = document.getElementById('enemyHPBar');
        if (percentage > 50) {
            hpBar.style.background = 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)';
        } else if (percentage > 25) {
            hpBar.style.background = 'linear-gradient(90deg, #f5a623 0%, #f76f00 100%)';
        } else {
            hpBar.style.background = 'linear-gradient(90deg, #f5576c 0%, #c71585 100%)';
        }
    },

    // 敵のセリフを表示
    displayPrompt(text) {
        document.getElementById('promptText').textContent = text;
    },

    // タイピング入力フィールドを有効化
    enableTypingInput() {
        const input = document.getElementById('typingInput');
        input.disabled = false;
        input.value = '';
        input.focus();
    },

    // タイピング入力フィールドを無効化
    disableTypingInput() {
        document.getElementById('typingInput').disabled = true;
    },

    // タイピングガイドを更新
    updateTypingGuide(currentInput, targetText) {
        const guide = document.getElementById('typingGuide');
        let guideText = '';

        for (let i = 0; i < targetText.length; i++) {
            if (i < currentInput.length) {
                if (currentInput[i] === targetText[i]) {
                    guideText += `<span style="color: green;">${targetText[i]}</span>`;
                } else {
                    guideText += `<span style="color: red;">${targetText[i]}</span>`;
                }
            } else {
                guideText += `<span style="color: gray;">${targetText[i]}</span>`;
            }
        }

        guide.innerHTML = guideText;
    },

    // ステータス表示を更新
    updateStats(accurateCount, targetCount, typingSpeed, accuracy) {
        document.getElementById('accurateCount').textContent = accurateCount;
        document.getElementById('targetCount').textContent = targetCount;
        document.getElementById('typingSpeed').textContent = typingSpeed;
        document.getElementById('accuracy').textContent = accuracy;
    },

    // ステータスメッセージを更新
    updateStatusMessage(message) {
        document.getElementById('statusMessage').textContent = message;
    },

    // バトルログに追加
    addBattleLog(message, type = 'normal') {
        const log = document.getElementById('battleLog');
        const timestamp = new Date().toLocaleTimeString();
        let color = '#333';

        if (type === 'damage') {
            color = '#f5576c';
        } else if (type === 'success') {
            color = '#667eea';
        } else if (type === 'info') {
            color = '#f5a623';
        }

        const logEntry = document.createElement('div');
        logEntry.style.color = color;
        logEntry.style.marginBottom = '5px';
        logEntry.style.fontSize = '12px';
        logEntry.innerHTML = `[${timestamp}] ${message}`;

        log.appendChild(logEntry);
        log.scrollTop = log.scrollHeight;
    },

    // ============================================
    // ステージ選択画面のUI更新
    // ============================================

    // 現在の進行状況を更新
    updateCurrentStatus() {
        const playerData = gameManager.playerData;
        const progress = calculateProgress(playerData.currentStage);
        const stage = getStage(playerData.currentStage);

        let statusText = `現在: ${playerData.title} | 給料: ¥${playerData.salary.toLocaleString()} | `;
        statusText += `進行度: ${progress}%`;

        if (stage) {
            statusText += ` | 次のステージ: Stage ${playerData.currentStage}`;
        }

        document.getElementById('currentStatus').textContent = statusText;
    },

    // ============================================
    // クリア画面のUI更新
    // ============================================

    // クリア画面の内容を更新
    updateClearScreen(stageId, results) {
        const stage = getStage(stageId);
        const enemy = getEnemy(stageId);

        document.getElementById('clearTitle').textContent = `${enemy.name}を倒しました！`;
        document.getElementById('finalAccurateCount').textContent = results.accurateCount;
        document.getElementById('finalTypingSpeed').textContent = results.typingSpeed;
        document.getElementById('finalAccuracy').textContent = results.accuracy;

        // 昇進情報
        const promotionInfo = document.getElementById('promotionInfo');
        promotionInfo.innerHTML = '';

        if (stage.reward.promotion) {
            const promotionDiv = document.createElement('div');
            promotionDiv.className = 'promotion-info';
            promotionDiv.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
            promotionDiv.style.color = 'white';
            promotionDiv.style.padding = '20px';
            promotionDiv.style.borderRadius = '10px';
            promotionDiv.style.marginBottom = '20px';
            promotionDiv.innerHTML = `<h3>🎉 昇進: ${stage.reward.title}</h3>`;
            promotionInfo.appendChild(promotionDiv);
        }

        if (stage.reward.salary) {
            const salaryDiv = document.createElement('div');
            salaryDiv.style.background = '#f5f5f5';
            salaryDiv.style.padding = '15px';
            salaryDiv.style.borderRadius = '8px';
            salaryDiv.style.marginBottom = '10px';
            salaryDiv.innerHTML = `<p>💰 給料: <strong>¥${stage.reward.salary.toLocaleString()}</strong></p>`;
            promotionInfo.appendChild(salaryDiv);
        }

        if (stage.reward.specialEvent) {
            const eventDiv = document.createElement('div');
            eventDiv.style.background = '#f0f0f0';
            eventDiv.style.padding = '15px';
            eventDiv.style.borderRadius = '8px';
            eventDiv.innerHTML = `<p>⭐ ${stage.reward.specialEvent}</p>`;
            promotionInfo.appendChild(eventDiv);
        }
    },

    // ============================================
    // ゲームオーバー画面のUI更新
    // ============================================

    // ゲームオーバーメッセージを設定
    setGameOverMessage(message) {
        document.getElementById('gameOverMessage').textContent = message;
    },

    // ============================================
    // ユーティリティ
    // ============================================

    // 入力値を取得
    getTypingInput() {
        return document.getElementById('typingInput').value;
    },

    // 入力値をクリア
    clearTypingInput() {
        document.getElementById('typingInput').value = '';
    },

    // 入力フィールドにフォーカス
    focusTypingInput() {
        document.getElementById('typingInput').focus();
    },

    // スクロール位置をリセット
    resetScrollPositions() {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.scrollTop = 0;
        });
    }
};
