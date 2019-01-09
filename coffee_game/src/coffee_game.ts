
interface Number {
	toPx: () => string
}

Number.prototype.toPx = function(): string {
	return String(this) + 'px'
}


class Board {
	width = 400
	height = 400
	time = 0
	counter = 0
	rounds = 10
	div = document.createElement('div')
	results = document.createElement('div')
	resultsWith = document.createElement('div')
	resultsWithout = document.createElement('div')
	withBrainBrew = false
	control?: ControlButtons
	constructor() {
	
		// this.div.innerHTML = "test 4"
		this.div.style.width = this.width.toPx()
		this.div.style.height = this.height.toPx()
		this.div.style.position = 'relative'
		this.div.style.border = 'solid'
		this.div.style.borderWidth = 'thin'
		this.div.style.margin = '0 auto'
		this.div.style.backgroundImage = "url('img/coffee_tree.jpg')"
		this.div.style.backgroundSize = this.width.toPx() + ' ' + this.height.toPx()

		let height = '100px'
		this.results.style.width = this.width.toPx()
		this.results.style.height = height
		this.results.style.border = 'solid'
		this.results.style.borderWidth = 'thin'
		this.results.style.margin = '5px auto'
		
		this.resultsWithout.style.width = (this.width / 2).toPx() 
		this.resultsWithout.style.height = height
		this.resultsWithout.style.cssFloat = 'left'
		this.results.append(this.resultsWithout)
		this.displayWithoutStats()

		this.resultsWith.style.width = (this.width / 2).toPx() 
		this.resultsWith.style.height = height
		this.resultsWith.style.cssFloat = 'right'
		this.results.append(this.resultsWith)
		this.displayWithStats()


	}
	displayWithStats() {
		let json = localStorage.getItem('with')
		if (json != null) {
			let score = JSON.parse(json)
			let resStr = 'with BRAIN BREW<br>'
			resStr += 'score: ' + String(score.avgTime) + '<br>'
			resStr += 'games played: ' + String(score.gamesPlayed)
			this.resultsWith.innerHTML = resStr
		}
	}
	displayWithoutStats() {
		let json = localStorage.getItem('without')
		if (json != null) {
			let score = JSON.parse(json)
			let resStr = 'without BRAIN BREW<br>'
			resStr += 'score: ' + String(score.avgTime) + '<br>'
			resStr += 'games played: ' + String(score.gamesPlayed)
			this.resultsWithout.innerHTML = resStr
		}
	}
	startWithoutBrainBrew() {
		this.withBrainBrew = false
		this.tick()
	}
	startWithBrainBrew() {
		this.withBrainBrew = true
		this.tick()
	}
	tick() {
		let bean = new CoffeeBean()
		this.add(bean)
		this.rounds--

		if (this.rounds > 0) {
			setTimeout(this.tick.bind(this), 1000)
		} 
	}
	add(bean: CoffeeBean) {

		bean.top = (this.height - bean.size) * bean.y
		bean.left = (this.width - bean.size) * bean.x

		bean.board = this
		// console.log(bean)

		this.div.appendChild(bean.div)
	}
	remove(bean: CoffeeBean) {

		this.div.removeChild(bean.div)
		bean.board = undefined

		this.counter++
		this.time += new Date().getTime() - bean.constructTime.getTime()

		if (!this.div.firstChild && this.rounds <= 0) {
			this.end()
			this.rounds = 10
		}
	}
	end() {
		console.log('end')
		if (this.control != undefined) {
			this.control.displayStart()
		}
		let json: string | null
		if (this.withBrainBrew) {
			json = localStorage.getItem('with')
		} else {
			json = localStorage.getItem('without')
		}
		let avgTime: number = 0
		let gamesPlayed: number = 0
		if (json != null) {
			let score = JSON.parse(json)
			avgTime = score.avgTime
			gamesPlayed = score.gamesPlayed
		}

		console.log('before score: ', avgTime)
		console.log('current score: ', this.time)

		let newAvgTime = Math.round((avgTime * gamesPlayed + this.time) / (gamesPlayed + 1))
		gamesPlayed++
		

		console.log('new score: ', newAvgTime)

		let newScore = {avgTime: newAvgTime, gamesPlayed: gamesPlayed}
		let newJson = JSON.stringify(newScore)

		if (this.withBrainBrew) {
			localStorage.setItem('with', newJson)
			this.displayWithStats()
		} else {
			localStorage.setItem('without', newJson)
			this.displayWithoutStats()
		}

		alert('Congratulations, your score is '+ this.time + '\n(lower is better)')
		this.time = 0
		
	}
}

class CoffeeBean {
	size = 20
	x: number; 
	y: number;
	board?: Board
	div = document.createElement('div')
	constructTime: Date

	constructor() {
		this.x = Math.random()
		this.y = Math.random()
		
		// this.div.innerHTML = "be"
		this.div.style.position = 'absolute'
		this.div.style.width = this.size.toPx()
		this.div.style.height = this.size.toPx()
		// this.div.style.border = 'solid'
		this.div.style.backgroundImage = "url('img/coffee_bean.png')"
		this.div.style.backgroundSize = this.size.toPx()

		this.div.onclick = this.click.bind(this)

		this.constructTime = new Date()
	}
	set top(val: number) {
		this.div.style.top = val.toPx()
	}
	set left(val: number) {
		this.div.style.left = val.toPx()
	}
	click() {
		if (this.board == null) {
			alert('semantic error')
			console.log('semantic error')
		} else {
			this.board.remove(this)
		}
	}
}

class ControlButtons {
	div = document.createElement('div')
	startButton = document.createElement('button')
	withoutButton = document.createElement('button')
	withButton = document.createElement('button')
	countDownLabel = document.createElement('label')
	board: Board
	countdown = 3
	withBrainBrew = false
	constructor(board: Board) {
		this.board = board
		this.board.control = this

		this.div.align = 'center'
		this.div.style.height = '25px'

		this.startButton.innerHTML = 'Start'
		this.startButton.onclick = this.displayWithWithout.bind(this)

		this.withoutButton.innerHTML = 'no BRAIN BREW consumed'
		this.withoutButton.onclick = this.startWithout.bind(this) 

		this.withButton.innerHTML = 'I drank BRAIN BREW!'
		this.withButton.onclick = this.startWith.bind(this)


		this.displayStart()
	}
	// TODO: Refactor let self = this
	empty() {
		while(this.div.firstChild) {
			this.div.removeChild(this.div.firstChild)
		}
	}
	displayStart() {
		this.empty()
		this.div.append(this.startButton)
	}
	displayWithWithout() {
		this.empty()
		this.div.append(this.withoutButton)
		this.div.append(this.withButton)
	}
	startGame() {
		if (this.withBrainBrew) {
			this.board.startWithBrainBrew()
		} else {
			this.board.startWithoutBrainBrew()
		}
	}
	startWithout() {
		this.withBrainBrew = false
		this.startCountDown()
	}
	startWith() {
		this.withBrainBrew = true
		this.startCountDown()
	}
	startCountDown() {
		this.empty()
		this.div.append(this.countDownLabel)

		if (this.countdown > 0) {
			this.countDownLabel.innerHTML = String(this.countdown)
			this.countdown--
			setTimeout(this.startCountDown.bind(this), 1000)
		} else {
			this.countDownLabel.innerHTML = '&nbsp;'
			this.countdown = 3
			this.startGame()
		}
	}
}


let board = new Board()
let control = new ControlButtons(board)

document.body.append(control.div)
document.body.append(board.div)
document.body.append(board.results)