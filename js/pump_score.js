fetchAllScores();
	
function fetchAllScores() {
	let count = parseInt($('.total_wrap .t2').text());
	let pages = 1;
	if($('.board_paging button:last').length > 0) {
		pages = parseInt($('.board_paging button:last').attr('onclick').split('page=')[1].split('\'')[0]);
	}	
	$('head').append( $('<link rel="stylesheet" type="text/css" />').attr('href', 'https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css') );	
	$('#contents').css('background', '#1a1b1e');
	$('#header').remove();
	$('.rating_ranking_wrap.bg').html('')
	showProgress(count);
	let scores = [];
	let current_url = window.location.href;	

	if(window.location.href.indexOf('?') == -1) {
		current_url = current_url + '?';
	}

	let mark = 1;
	let allSongs = [];
	for (var i = 1; i <= pages; i++) {
		fetchScorePages(current_url + '&&page=' + i, i)
			.then((songs) => {
				allSongs = allSongs.concat(songs)
				if(mark == pages) {
					$('#progress_pane').hide();
					showScores(allSongs);
				}
				mark++;
			});
	}
}

function showProgress(page) {
	$('.pageWrap').prepend('<div id="progress_pane"><h1 style="color:white">Fetching scores:</h1><div id="fetch_progress" class="progress" style="height: 30px;"></div>');
	$('#fetch_progress').append('<div id="fetch_progress_bar" class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" ' +
		'aria-valuenow="0" aria-valuemin="0" aria-valuemax="' + page + '" style="width: 0%">'+
		'<div style="position: absolute; text-align: center; line-height: 20px; overflow: hidden; color: black; right: 0; left: 0; top: 0;">'+
		'<span style="font-size: 20px;"><span id="current_progress_page">0</span>/' + page + '</span></div></div>');
}

function showScores(allSongs) {
	allSongs.sort(function(a, b){
	    var a1 = a.songName, b1 = b.songName;
	    if(a1 == b1) return 0;
	    return a1 < b1 ? -1 : 1;
	});

	$('.rating_ranking_wrap.bg').html('<div id="tablePane" class="row text-white"></div>');
	for(var i = 0; i < allSongs.length; i++) {
		$('#tablePane').append(allSongs[i].html);
	}	
}

async function fetchScorePages(urlPage, pageIndex) {
	domPage = await fetchPage(urlPage);	
	const rowsPage = domPage.querySelectorAll('.li_in a');
	let songs = [];	

	let iMark = 1;
	for (var iPage = 0; iPage < rowsPage.length; iPage++) {
		
		await fetchScores(rowsPage[iPage].href)
			.then((songScores) => {
				let currMark = parseInt($('#current_progress_page').html());
				let currCount = parseInt($('.total_wrap .t2').text());
				$('#current_progress_page').html(currMark + 1);
				$('#fetch_progress_bar').css('width', (((currMark + 1)/currCount)*100) + '%');
				songs.push(songScores);

				if(iMark == rowsPage.length) {
					// Do something maybe
				}
				iMark++;				
			});
	}
	return songs;
}

async function fetchScores(url) {
	dom = await fetchPage(url);
	songScore = [];
	scores = [];
	let top = 3; //Get TOP 3 only
	for (var i = 0; i < top; i++) {
		name = $(dom.querySelectorAll('.rangking_list_w li .profile_name:first-child')[i]).html();
		nameId = $(dom.querySelectorAll('.rangking_list_w li .profile_name.st1')[i]).html();
		score = $(dom.querySelectorAll('.rangking_list_w li .tt.en')[i]).html();
		score_rate = $(dom.querySelectorAll('.rangking_list_w li .grade')[i]);
		date = $(dom.querySelectorAll('.rangking_list_w li .date .tt')[i]).html();		

		songScore = {
			name: name,
			nameId: nameId,
			score: score,
			score_rate: score_rate,
			date: date
		}

		scores.push(songScore);
	}

	pgCount = 0;
	sssCount = 0;
	ssCount = 0;
	sCount = 0;
	lowCount = 0;
	$.each( $(dom.querySelectorAll('.rangking_list_w li .tt.en')), function( key, value ) {
		let score = parseInt(value.innerText.replace(/,/g, ''))
		if(score == 1000000) {
			pgCount++;
		}		

		if(score >= 990000) {
			sssCount++;
		} else if(score >= 980000) {
			ssCount++;
		} else if(score >= 970000) {
			sCount++;
		} else {
			lowCount++;
		}
    });

    topThree = '';
	for (var i = 0; i < scores.length; i++) {
		value = scores[i];

		switch (i) {
		    case 0:
		        medal = "https://piugame.com/l_img/goldmedal.png";
		        break;
		    case 1:
		        medal = "https://piugame.com/l_img/silvermedal.png";
		        break;
		    case 2:
		        medal = "https://piugame.com/l_img/bronzemedal.png";
		        break;
		}
		date = value.date !== undefined ? value.date : '--'
		name = value.name !== undefined ? value.name : '--'
		nameId = value.nameId !== undefined ? value.nameId : '--'
		score = value.score !== undefined ? value.score : '--'

		if(score != '--') {
			topThree += '<div class="col-md-4"><div class="row">' +
					'<div class="col-md-3" style="padding-right: 0; padding-left: 15px"><img src="' + medal + '"></div>' +
					'<div class="col-md-9 pl-0"><div style="text-align: left;">' + name + '</div>' +
					'<div style="text-align: right;"><h3>' + score + '</h3></div></div></div></div>';			
		}		
	}

	stat = '<div class="row">' +
			'<div class="col-md-3">PG Count: ' + pgCount + '</div>' + 
			'<div class="col-md-3">SSS Count: ' + sssCount + '</div>' +
			'<div class="col-md-3">SS Count: ' + ssCount + '</div>' +
			'<div class="col-md-3">Lower S: ' + lowCount + '</div></div>';

	songName = $(dom.querySelectorAll('.songName_w .tt')[0]).html();
	songBg = dom.querySelectorAll('.songImg_w .bgfix')[0].style.backgroundImage.split('url("')[1].split('")')[0];
	songDiff = dom.querySelectorAll('.stepBall_in')[0].outerHTML;

	pane = '<div class="col-md-6 mb-4"><table class="table table-dark"><thead><tr><th class="songImg_w col-md-3"><img src="' + songBg + '" height="100"></th>' +
    		'<th class="songName_w col-md-6 align-middle"><h4 class="align-middle text-white"><b>' + songName + '</b></h4></th>' + 
    		'<th colspan="2" class="level_w col-md-3 stepBall_img_wrap pb-3">' + songDiff + '</div></th></tr></thead></table>' +
    		'<tbody><tr><td colspan="4"><div class="row">' + topThree + '</div></td></tr>' +
    		'<tr><td colspan="4">' + stat + '</td></tr></tbody></table></div>';

	songScores = {
		songName: songName,
		scores: scores,
		pgCount: (pgCount !== undefined) ? pgCount : 0,
		sssCount: (sssCount !== undefined) ? sssCount : 0,
		ssCount: (ssCount !== undefined) ? ssCount : 0,
		lowCount: (lowCount !== undefined) ? lowCount : 0,
		html: pane
	}

	return songScores;
}

async function fetchPage(url) {
	const response = await fetch(url, {redirect: 'error'});
	const html = await response.text();
	const parser = new DOMParser();
	return parser.parseFromString(html, 'text/html');
}

function calculateRating(level, rate, type) {
	rate_index = {
		'F':0.4,
		'D':0.5,
		'C':0.6,
		'B':0.7,
		'A':0.8,
		'A+':0.9,
		'AA':1,
		'AA+':1.05,
		'AAA':1.1,
		'AAA+':1.15,
		'S':1.2,
		'S+':1.26,
		'SS':1.32,
		'SS+':1.38,
		'SSS':1.44,
		'SSS+':1.5,
	};

	if(type == 'normal') {
		level_base = {
			'10':100,
			'11':110,
			'12':130,
			'13':160,
			'14':200,
			'15':250,
			'16':310,
			'17':380,
			'18':460,
			'19':550,
			'20':650,
			'21':760,
			'22':880,
			'23':1010,
			'24':1150,
			'25':1300,
			'26':1460,
			'27':1630,
			'28':1810,
		};
		if(level < 10) return 0;
		rating = parseInt(level_base[level]) * parseFloat(rate_index[rate]);
	} else if(type == 'coop') {
		level_base = 2000;
		rating = parseInt(level_base) * parseFloat(rate_index[rate]);
	}
	return Math.round(rating.toFixed(2));
}
