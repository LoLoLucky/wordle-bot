console.log('press space to fill in a word')

let load = async name=> (await fetch(`https://raw.githubusercontent.com/LoLoLucky/wordle-bot/main/${name}.csv`).then(data=> data.text())).split(',')

let answers = load('answers')
let guesses = load('guesses')

print(answers)

let score=(guess, answer)=> {
	let extra = [...answer].map((l,i)=>l != guess[i]? l : 0).join('')
	return [...guess].map((l,i)=> 
		l == answer[i] ? 'g' 
		: guess.slice(0,i).split(l).length < extra.split(l).length ? 'y' 
		: '-'
	).join('')
}

let best_guess =(guesses, answers)=> {
	let goodness =p=> 2 * p * (1-p)

	let ratings = guesses.map(guess=> 
		answers.map(answer=> score(guess, answer))
			.map(score=> (p=> p * (1-p))(answers.filter(v=> v==score).length / answers.length))
			.reduce((a,b)=> a+b)
	)

	let best_guesses = guesses.filter((_,i)=> ratings[i] == Math.max(...ratings))
	return best_guesses.filter(guess=> answers.some(answer=> answer == guess))[0] || best_guesses[0]
}

let type =word=>
	[...Array(5).fill('Backspace'), ...word, 'Enter']
		.forEach(key=> window.dispatchEvent(new KeyboardEvent('keydown', {'key': key})))

let get_row =i=>
	document.querySelector('game-app').shadowRoot
			.querySelector('game-theme-manager')
			.querySelectorAll('game-row')[i]

let get_scoring =tiles=>
	[...tiles]
		.map(e=> e.getAttribute('evaluation'))
		.map(v=> v == 'absent' ? '-' : v == 'present' ? 'y' : 'g')
		.join('')

document.addEventListener('keydown', e=> {
	if(e.code == 'Space') {
		for(let i = 0; i<5; i++) {
			let row = get_row(i)
			let tiles = row.shadowRoot.querySelectorAll('game-tile')
			if(!tiles[0].hasAttribute('reveal'))
				break
			let guess= row.getAttribute('letters')
			let scoring = get_scoring(tiles)
			answers = answers.filter(answer=> scoring == score(guess, answer))
		}
		letters = best_guess(guesses, answers)
		type(letters)
	}
});
