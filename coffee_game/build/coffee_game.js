Number.prototype.toPx = function () {
    return String(this) + 'px';
};
var Board = /** @class */ (function () {
    function Board() {
        this.width = 400;
        this.height = 400;
        this.time = 0;
        this.counter = 0;
        this.rounds = 10;
        this.div = document.createElement('div');
        this.results = document.createElement('div');
        this.resultsWith = document.createElement('div');
        this.resultsWithout = document.createElement('div');
        this.withBrainBrew = false;
        // this.div.innerHTML = "test 4"
        this.div.style.width = this.width.toPx();
        this.div.style.height = this.height.toPx();
        this.div.style.position = 'relative';
        this.div.style.border = 'solid';
        this.div.style.borderWidth = 'thin';
        this.div.style.margin = '0 auto';
        this.div.style.backgroundImage = "url('img/coffee_tree.jpg')";
        this.div.style.backgroundSize = this.width.toPx() + ' ' + this.height.toPx();
        var height = '100px';
        this.results.style.width = this.width.toPx();
        this.results.style.height = height;
        this.results.style.border = 'solid';
        this.results.style.borderWidth = 'thin';
        this.results.style.margin = '5px auto';
        this.resultsWithout.style.width = (this.width / 2).toPx();
        this.resultsWithout.style.height = height;
        this.resultsWithout.style.cssFloat = 'left';
        this.results.append(this.resultsWithout);
        this.displayWithoutStats();
        this.resultsWith.style.width = (this.width / 2).toPx();
        this.resultsWith.style.height = height;
        this.resultsWith.style.cssFloat = 'right';
        this.results.append(this.resultsWith);
        this.displayWithStats();
    }
    Board.prototype.displayWithStats = function () {
        var json = localStorage.getItem('with');
        if (json != null) {
            var score = JSON.parse(json);
            var resStr = 'with BRAIN BREW<br>';
            resStr += 'score: ' + String(score.avgTime) + '<br>';
            resStr += 'games played: ' + String(score.gamesPlayed);
            this.resultsWith.innerHTML = resStr;
        }
    };
    Board.prototype.displayWithoutStats = function () {
        var json = localStorage.getItem('without');
        if (json != null) {
            var score = JSON.parse(json);
            var resStr = 'without BRAIN BREW<br>';
            resStr += 'score: ' + String(score.avgTime) + '<br>';
            resStr += 'games played: ' + String(score.gamesPlayed);
            this.resultsWithout.innerHTML = resStr;
        }
    };
    Board.prototype.startWithoutBrainBrew = function () {
        this.withBrainBrew = false;
        this.tick();
    };
    Board.prototype.startWithBrainBrew = function () {
        this.withBrainBrew = true;
        this.tick();
    };
    Board.prototype.tick = function () {
        var bean = new CoffeeBean();
        this.add(bean);
        this.rounds--;
        if (this.rounds > 0) {
            setTimeout(this.tick.bind(this), 1000);
        }
    };
    Board.prototype.add = function (bean) {
        bean.top = (this.height - bean.size) * bean.y;
        bean.left = (this.width - bean.size) * bean.x;
        bean.board = this;
        // console.log(bean)
        this.div.appendChild(bean.div);
    };
    Board.prototype.remove = function (bean) {
        this.div.removeChild(bean.div);
        bean.board = undefined;
        this.counter++;
        this.time += new Date().getTime() - bean.constructTime.getTime();
        if (!this.div.firstChild && this.rounds <= 0) {
            this.end();
            this.rounds = 10;
        }
    };
    Board.prototype.end = function () {
        console.log('end');
        if (this.control != undefined) {
            this.control.displayStart();
        }
        var json;
        if (this.withBrainBrew) {
            json = localStorage.getItem('with');
        }
        else {
            json = localStorage.getItem('without');
        }
        var avgTime = 0;
        var gamesPlayed = 0;
        if (json != null) {
            var score = JSON.parse(json);
            avgTime = score.avgTime;
            gamesPlayed = score.gamesPlayed;
        }
        console.log('before score: ', avgTime);
        console.log('current score: ', this.time);
        var newAvgTime = Math.round((avgTime * gamesPlayed + this.time) / (gamesPlayed + 1));
        gamesPlayed++;
        console.log('new score: ', newAvgTime);
        var newScore = { avgTime: newAvgTime, gamesPlayed: gamesPlayed };
        var newJson = JSON.stringify(newScore);
        if (this.withBrainBrew) {
            localStorage.setItem('with', newJson);
            this.displayWithStats();
        }
        else {
            localStorage.setItem('without', newJson);
            this.displayWithoutStats();
        }
        alert('Congratulations, your score is ' + this.time + '\n(lower is better)');
        this.time = 0;
    };
    return Board;
}());
var CoffeeBean = /** @class */ (function () {
    function CoffeeBean() {
        this.size = 20;
        this.div = document.createElement('div');
        this.x = Math.random();
        this.y = Math.random();
        // this.div.innerHTML = "be"
        this.div.style.position = 'absolute';
        this.div.style.width = this.size.toPx();
        this.div.style.height = this.size.toPx();
        // this.div.style.border = 'solid'
        this.div.style.backgroundImage = "url('img/coffee_bean.png')";
        this.div.style.backgroundSize = this.size.toPx();
        this.div.onclick = this.click.bind(this);
        this.constructTime = new Date();
    }
    Object.defineProperty(CoffeeBean.prototype, "top", {
        set: function (val) {
            this.div.style.top = val.toPx();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CoffeeBean.prototype, "left", {
        set: function (val) {
            this.div.style.left = val.toPx();
        },
        enumerable: true,
        configurable: true
    });
    CoffeeBean.prototype.click = function () {
        if (this.board == null) {
            alert('semantic error');
            console.log('semantic error');
        }
        else {
            this.board.remove(this);
        }
    };
    return CoffeeBean;
}());
var ControlButtons = /** @class */ (function () {
    function ControlButtons(board) {
        this.div = document.createElement('div');
        this.startButton = document.createElement('button');
        this.withoutButton = document.createElement('button');
        this.withButton = document.createElement('button');
        this.countDownLabel = document.createElement('label');
        this.countdown = 3;
        this.withBrainBrew = false;
        this.board = board;
        this.board.control = this;
        this.div.align = 'center';
        this.div.style.height = '25px';
        this.startButton.innerHTML = 'Start';
        this.startButton.onclick = this.displayWithWithout.bind(this);
        this.withoutButton.innerHTML = 'no BRAIN BREW consumed';
        this.withoutButton.onclick = this.startWithout.bind(this);
        this.withButton.innerHTML = 'I drank BRAIN BREW!';
        this.withButton.onclick = this.startWith.bind(this);
        this.displayStart();
    }
    // TODO: Refactor let self = this
    ControlButtons.prototype.empty = function () {
        while (this.div.firstChild) {
            this.div.removeChild(this.div.firstChild);
        }
    };
    ControlButtons.prototype.displayStart = function () {
        this.empty();
        this.div.append(this.startButton);
    };
    ControlButtons.prototype.displayWithWithout = function () {
        this.empty();
        this.div.append(this.withoutButton);
        this.div.append(this.withButton);
    };
    ControlButtons.prototype.startGame = function () {
        if (this.withBrainBrew) {
            this.board.startWithBrainBrew();
        }
        else {
            this.board.startWithoutBrainBrew();
        }
    };
    ControlButtons.prototype.startWithout = function () {
        this.withBrainBrew = false;
        this.startCountDown();
    };
    ControlButtons.prototype.startWith = function () {
        this.withBrainBrew = true;
        this.startCountDown();
    };
    ControlButtons.prototype.startCountDown = function () {
        this.empty();
        this.div.append(this.countDownLabel);
        if (this.countdown > 0) {
            this.countDownLabel.innerHTML = String(this.countdown);
            this.countdown--;
            setTimeout(this.startCountDown.bind(this), 1000);
        }
        else {
            this.countDownLabel.innerHTML = '&nbsp;';
            this.countdown = 3;
            this.startGame();
        }
    };
    return ControlButtons;
}());
var board = new Board();
var control = new ControlButtons(board);
document.body.append(control.div);
document.body.append(board.div);
document.body.append(board.results);
//# sourceMappingURL=coffee_game.js.map