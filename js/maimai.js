fetchAllScores();
	
async function fetchAllScores() {	
	var initialUrl = 'https://maimaidx-eng.com/maimai-mobile/record/musicVersion/search/?version=0&diff=3';
	var initialDom = await fetchPage(initialUrl);
	var latestVersion = $(initialDom.querySelector('select[name="version"] option:last')[0]).val();
	console.log(latestVersion);
	// showProgress(pages);
	// let scores = [];
	// let current_url = window.location.href;	

	// if(window.location.href.indexOf('?') == -1) {
	// 	current_url = current_url + '?';
	// }

	// let mark = 1;
	// // https://maimaidx-eng.com/maimai-mobile/record/musicVersion/search/?version=20&diff=3
	// for (var i = 1; i <= pages; i++) {
	// 	fetchScores(current_url + '&&page=' + i)
	// 		.then((score) => {
	// 			console.log(mark + '/' + pages);
	// 			$('#current_progress_page').html(mark);
	// 			$('#fetch_progress_bar').css('width', ((mark/pages)*100) + '%');
	// 			for (var j = score.length - 1; j >= 0; j--) {
	// 				scores.push(score[j])
	// 			}
	// 			if(mark == pages) {
	// 				$('#progress_pane').hide();
	// 				run(scores)
	// 			}
	// 			mark++;
	// 		});
	// }
}

function showProgress(page) {
	$('.pageWrap').prepend('<div id="progress_pane"><h1 style="color:white">Fetching scores:</h1><div id="fetch_progress" class="progress" style="height: 30px;"></div>');
	$('#fetch_progress').append('<div id="fetch_progress_bar" class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" ' +
		'aria-valuenow="0" aria-valuemin="0" aria-valuemax="' + page + '" style="width: 0%">'+
		'<div style="position: absolute; text-align: center; line-height: 20px; overflow: hidden; color: black; right: 0; left: 0; top: 0;">'+
		'<span style="font-size: 20px;"><span id="current_progress_page">0</span>/' + page + '</span></div></div>');
}

async function fetchScores(url) {
	dom = await fetchPage(url);
	const rows = dom.querySelectorAll('.my_best_scoreList .in');
	songs = [];
	for (var i = 0; i < rows.length; i++) {
		song = $(dom.querySelectorAll('.my_best_scoreList .in .song_name p')[i]).html();
		score = $(dom.querySelectorAll('.my_best_scoreList .in .num')[i]).html();
		score_rate = $(dom.querySelectorAll('.my_best_scoreList .in .etc_con .img:not(.st1) img')[i]).attr('src');
		score_rate = score_rate.split('/grade/')[1].split('.png')[0];

		score_plate = $(dom.querySelectorAll('.my_best_scoreList .in .etc_con .st1 img')[i]).attr('src');
		score_plate = score_plate.split('/plate/')[1].split('.png')[0];

		level_type_data = $(dom.querySelectorAll('.my_best_scoreList .in .stepBall_in')[i]).attr('style').split('full/')[1].split('_bg')[0];
		switch(level_type_data) {
			case 's':
			    level_type = 'single';
			    break;
			case 'd':
			    level_type = 'double';
			    break;
			default:
			level_type = 'coop';
		}

		level = '';
		levels = $(dom.querySelectorAll('.my_best_scoreList .in .stepBall_in')[0]).find('.imG');

		switch(level_type_data) {
			case 's':
			case 'd':
				for (var j = 0; j < levels.length; j++) {
					url = $(dom.querySelectorAll('.my_best_scoreList .in .stepBall_in')[i]).find('.imG img').eq(j).attr('src');
					level += url.split('num_')[1].split('.png')[0];
				}
				rating = calculateRating(level, rating_text[score_rate], 'normal');
				level_text = level_type_data + level;
				level_text = level_text.toUpperCase();
				break;
			default:
			    url = $(dom.querySelectorAll('.my_best_scoreList .in .stepBall_in')[i]).find('.imG img').eq(1).attr('src');
				level = url.split('num_')[1].split('.png')[0];
				rating = calculateRating(null, rating_text[score_rate], 'coop');
				level_text = 'Cx' + level;
		}						

		song = {
		name: song,
		level_text: level_text,
		score_text: score,
		score_rate_text: rating_text[score_rate],
		rating: rating,
		score_plate_text: plate_text[score_plate],
		level_type: level_type,
		level: level,
		score: score.replaceAll(',',''),
		score_rate: score_rate,
		score_plate: score_plate,
	}

	songs.push(song);
	}

	songs.sort(function(a, b){
	    var a1 = a.rating, b1 = b.rating;
	    if(a1 == b1) {
		var a2 = a.score, b2 = b.score;
		    if(a2 == b2) {			    	
			return 0;
		    }	
		return a2 > b2 ? -1 : 1;
	    }
	    return a1 > b1 ? -1 : 1;
	});

	return songs;
}

async function fetchPage(url) {
	const response = await fetch(url, {redirect: 'error'});
	const html = await response.text();
	const parser = new DOMParser();
	return parser.parseFromString(html, 'text/html');
}