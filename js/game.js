/**
 * メインゲームロジック
 * ゲーム全体の制御と状態管理
 */

const gameManager = {
    // ゲーム状態
    currentStage: 1,
    isPlaying: false,
    battleStartTime: 0,
    typingStartTime: 0,
    currentPromptText: '',
    typedText: '',
    accurateKeyCount: 0,
    totalKeyCount: 0,
    targetAccurateCount: 0,
    currentEnemyHP: 0,
    maxEnemyHP: 0,
    enemyDamagePerRound: 10,

    // プレイヤーデータ
    playerData: {
        currentStage: 1,
        salary: 200000,
        title: "新入社員",
        completedStages: [],
        highScores: {}
    },

    /**
     * ゲーム初期化
     */
    init() {
        this.loadPlayerData();
        this.setupEventListeners();
    },

    /**
     * イベントリスナーのセットアップ
     */
    setupEventListeners() {
        const typingInput = document.getElementById('typingInput');
        
        // タイピング入力イベント
        typingInput.addEventListener('input', (e) => this.handleTyping(e));
        
        // Enterキー入力時
        typingInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.submitTyping();
            }
        });

        // キーダウンイベント（正確なキー数をカウント）
        typingInput.addEventListener('keydown', (e) => {
            if (e.key.length === 1 && this.isPlaying) {
                this.totalKeyCount++;
            }
        });
    },

    /**
     * プレイヤーデータをロード
     */
    loadPlayerData() {
        const saved = localStorage.getItem('typingGameData');
        if (saved) {
            this.playerData = JSON.parse(saved);
        }
        this.updatePlayerDataDisplay();
    },

    /**
     * プレイヤーデータをセーブ
     */
    savePlayerData() {
        localStorage.setItem('typingGameData', JSON.stringify(this.playerData));
    },

    /**
     * プレイヤーデータ表示を更新
     */
    updatePlayerDataDisplay() {
        UI.updatePlayerStatus(this.playerData.salary, this.playerData.title);
    },

    // ============================================
    // 画面遷移
    // ============================================

    /**
     * メイン画面を表示
     */
    backToMain() {
        UI.showMainScreen();
    },

    /**
     * ステージ選択画面を表示
     */
    startStageSelect() {
        UI.showStageSelectScreen();
    },

    /**
     * ステージ選択から戻る
     */
    backToStageSelect() {
        this.resetCurrentBattle();
        UI.showStageSelectScreen();
    },

    /**
     * 設定画面を表示
     */
    showSettings() {
        UI.showSettingsScreen();
    },

    /**
     * 説明画面を表示
     */
    showAbout() {
        UI.showAboutScreen();
    },

    /**
     * 進行状況をリセット
     */
    resetProgress() {
        if (confirm('本当に進行状況をリセットしますか？')) {
            this.playerData = {
                currentStage: 1,
                salary: 200000,
                title: "新入社員",
                completedStages: [],
                highScores: {}
            };
            this.savePlayerData();
            this.updatePlayerDataDisplay();
            alert('進行状況がリセットされました。');
        }
    },

    // ============================================
    // ゲーム開始
    // ============================================

    /**
     * ステージ開始
     */
    startStage(stageId) {
        const stage = getStage(stageId);
        const enemy = getEnemy(stageId);

        if (!stage || !enemy) {
            alert('ステージが見つかりません');
            return;
        }

        this.currentStage = stageId;
        this.targetAccurateCount = stage.requiredAccuracy;
        this.maxEnemyHP = enemy.hp;
        this.currentEnemyHP = enemy.hp;
        this.accurateKeyCount = 0;
        this.totalKeyCount = 0;
        this.typedText = '';
        this.isPlaying = true;

        UI.showGameScreen();
        UI.updateStageInfo(stageId, stage.name, enemy.name);
        UI.updateEnemyInfo(enemy);
        UI.updateStats(0, this.targetAccurateCount, 0, 0);
        UI.resetScrollPositions();

        // 最初のプロンプトを表示
        this.nextPrompt();
        this.battleStartTime = Date.now();
    },

    /**
     * 次のプロンプトを表示
     */
    nextPrompt() {
        const enemy = getEnemy(this.currentStage);
        const newPrompt = getRandomTypingPrompt(this.currentStage);
        const dialogue = getRandomDialogue(this.currentStage);

        this.currentPromptText = newPrompt;
        this.typedText = '';

        UI.displayPrompt(`${dialogue}\n\n"${newPrompt}" と入力してください`);
        UI.clearTypingInput();
        UI.enableTypingInput();
        UI.focusTypingInput();
        UI.updateTypingGuide('', newPrompt);
        UI.addBattleLog(`敵: "${dialogue}"`, 'info');
    },

    // ============================================
    // タイピング処理
    // ============================================

    /**
     * タイピング入力を処理
     */
    handleTyping(event) {
        const currentInput = event.target.value;
        this.typedText = currentInput;

        // ガイドを更新
        UI.updateTypingGuide(currentInput, this.currentPromptText);

        // 正確なキー入力数をカウント
        let accurateCount = 0;
        for (let i = 0; i < currentInput.length; i++) {
            if (currentInput[i] === this.currentPromptText[i]) {
                accurateCount++;
            }
        }

        this.accurateKeyCount = accurateCount;

        // 統計情報を更新
        this.updateStats();

        // 完全に正確に入力された場合
        if (currentInput === this.currentPromptText) {
            UI.addBattleLog(`✓ "${this.currentPromptText}" を正確に入力！`, 'success');
            this.submitTyping();
        }
    },

    /**
     * タイピングを送信
     */
    submitTyping() {
        if (!this.isPlaying) return;

        const isCorrect = this.typedText === this.currentPromptText;

        if (isCorrect) {
            // 敵にダメージ
            const damage = this.accurateKeyCount;
            this.currentEnemyHP = Math.max(0, this.currentEnemyHP - damage);

            UI.addBattleLog(`敵に ${damage} ダメージ！`, 'damage');
            UI.updateEnemyHP(this.currentEnemyHP, this.maxEnemyHP);

            // 目標達成判定
            if (this.accurateKeyCount >= this.targetAccurateCount) {
                UI.addBattleLog(`✓ 目標達成！`, 'success');
            }

            // 敵HP判定
            if (this.currentEnemyHP <= 0) {
                this.stageClear();
                return;
            }

            // 次のプロンプト
            this.nextPrompt();
        } else {
            // 誤入力時
            UI.addBattleLog(`✗ 誤入力。敵から攻撃を受けた！`, 'damage');
            this.nextPrompt();
        }
    },

    /**
     * ステータスを更新
     */
    updateStats() {
        if (!this.isPlaying) return;

        const now = Date.now();
        const elapsedSeconds = (now - this.battleStartTime) / 1000;

        let typingSpeed = 0;
        if (elapsedSeconds > 0) {
            typingSpeed = Math.round((this.totalKeyCount / elapsedSeconds) * 60);
        }

        let accuracy = 0;
        if (this.totalKeyCount > 0) {
            accuracy = Math.round((this.accurateKeyCount / this.totalKeyCount) * 100);
        }

        UI.updateStats(this.accurateKeyCount, this.targetAccurateCount, typingSpeed, accuracy);
    },

    /**
     * ステージクリア
     */
    stageClear() {
        this.isPlaying = false;
        UI.disableTypingInput();

        const stage = getStage(this.currentStage);
        const enemy = getEnemy(this.currentStage);

        // 統計情報を計算
        const now = Date.now();
        const elapsedSeconds = (now - this.battleStartTime) / 1000;
        const typingSpeed = Math.round((this.totalKeyCount / elapsedSeconds) * 60);
        const accuracy = Math.round((this.accurateKeyCount / this.totalKeyCount) * 100);

        // プレイヤーデータを更新
        this.playerData.currentStage = Math.max(this.playerData.currentStage, this.currentStage + 1);
        this.playerData.salary = stage.reward.salary;
        this.playerData.title = stage.reward.title;
        this.playerData.completedStages.push(this.currentStage);
        this.playerData.highScores[this.currentStage] = {
            typingSpeed: typingSpeed,
            accuracy: accuracy,
            accurateCount: this.accurateKeyCount
        };

        this.savePlayerData();
        this.updatePlayerDataDisplay();

        // クリア画面を表示
        UI.showClearScreen();
        UI.updateClearScreen(this.currentStage, {
            accurateCount: this.accurateKeyCount,
            typingSpeed: typingSpeed,
            accuracy: accuracy
        });

        // ストーリー進行
        if (this.currentStage === 10) {
            UI.addBattleLog('🎊 社長昇進！おめでとうございます！', 'success');
        } else if (this.currentStage === 20) {
            UI.addBattleLog('🏆 業界ナンバーワン達成！ゲームクリア！', 'success');
        }
    },

    /**
     * 次のステージへ進む
     */
    nextStage() {
        if (this.currentStage < 20) {
            this.startStage(this.currentStage + 1);
        } else {
            // ゲームクリア
            this.showGameComplete();
        }
    },

    /**
     * ゲーム完了画面を表示
     */
    showGameComplete() {
        alert('🏆 ゲームクリア！\n\nあなたは見事、業界ナンバーワンを達成しました！\nお疲れ様でした！');
        this.resetCurrentBattle();
        UI.showMainScreen();
    },

    /**
     * ステージをリトライ
     */
    retryStage() {
        this.resetCurrentBattle();
        this.startStage(this.currentStage);
    },

    /**
     * 現在のバトルをリセット
     */
    resetCurrentBattle() {
        this.isPlaying = false;
        this.accurateKeyCount = 0;
        this.totalKeyCount = 0;
        this.typedText = '';
        this.currentEnemyHP = 0;
        this.maxEnemyHP = 0;
        UI.disableTypingInput();
        UI.clearTypingInput();
    }
};

// ゲーム初期化
document.addEventListener('DOMContentLoaded', () => {
    gameManager.init();
});
