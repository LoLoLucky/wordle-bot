(async () => {
	let load = async name=> (await fetch(`https://raw.githubusercontent.com/LoLoLucky/wordle-bot/main/${name}.csv`).then(data=> data.text())).split(',')

	let answers = await load('answers')
	let guesses = await load('guesses')
	
	let score=(guess, answer)=> {
		let extra = [...answer].map((l,i)=> l != guess[i]? l : 0).join('')
		return [...guess].map((l,i)=> 
			l == answer[i] ? 'g' 
			: guess.slice(0,i).split(l).length < extra.split(l).length ? 'y' 
			: '-'
		).join('')
	}

	let best_guess =(guesses, answers)=> {
		let ratings = guesses.map(guess=> 
			answers.map(answer=> score(guess, answer))
				.reduce((a,score)=> a - (p=> p==0 || p==1 ? 0 : p * Math.log2(p) + (1-p) * Math.log2(1-p))
							 (answers.filter(v=> v==score).length / answers.length), 0))

		let best_guesses = guesses.filter((_,i)=> ratings[i] == Math.max(...ratings))
		return best_guesses.filter(guess=> answers.some(answer=> answer == guess))[0] || best_guesses[0]
	}

	let type =word=>
		[...Array(5).fill('Backspace'), ...word, 'Enter']
			.forEach(key=> window.dispatchEvent(new KeyboardEvent('keydown', {'key': key})))
	
	document.addEventListener('keydown', e=> {
		if(e.code == 'Space') {
			for(let i = 0; i<5; i++) {
				let row = document
					.querySelector('game-app').shadowRoot
					.querySelector('game-theme-manager')
					.querySelectorAll('game-row')[i]
				let tiles = row.shadowRoot.querySelectorAll('game-tile')
				if(!tiles[0].hasAttribute('reveal'))
					break
				let guess = row.getAttribute('letters')
				let scoring = [...tiles].map(v=> ({'correct':'g', 'present':'y'})[v.getAttribute('evaluation')] ?? '-').join('')
				answers = answers.filter(answer=> scoring == score(guess, answer))
			}
			type(best_guess(guesses, answers))
		}
	});
})()
