const diff = {
	'0': 'Basic',
	'1': 'Advanced',
	'2': 'Expert',
	'3': 'Master',
	'4': 'ReMaster',
};

fetchAll()

async function fetchPage(url) {
	const response = await fetch(url, {redirect: 'error'});
	const html = await response.text();
	const parser = new DOMParser();
	return parser.parseFromString(html, 'text/html');
}

function fetchAll() {
	scores = fetchAllScores();
}

async function fetchAllScores() {
	dom = await fetchPage('https://maimaidx-eng.com/maimai-mobile/record/musicVersion/');
	versions = $(dom.querySelectorAll('[name="version"] option'));
	fversions = [];
	fscores = [];

	$('.main_wrapper').html('<div id="progress" class="see_through_block m_5 m_t_10 p_15" style="text-align:left">Gathering data for:</div>');

	for (var i = 0; i < versions.length; i++) {
		fversion = $(dom.querySelectorAll('[name="version"] option'))[i].innerText
		fversions.push(fversion)
		fscores[fversion] = [];
		$('#progress').append('<br>- ' + fversion);
		for (var j = 0; j <= 4; j++) {		
			fscores[fversion][diff[j]] = await fetchScores('https://maimaidx-eng.com/maimai-mobile/record/musicVersion/search/?version=' + i + '&diff=' + j);
		}
	}
	showScores(fscores, fversions);
	return fscores;
}

function showScores(fscores, fversions) {
	mainHtml = '';
	for (var i = 0; i < fversions.length; i++) {		
		ver_id = i;

		if(i == 0) {
			ver_id = 1;			
		}

		if(i == 1) {
			html = '';
		} else {
			html = '<br><hr><img style="width:80%; margin-top:20px" src="https://numbuh1.github.io/img/nameplate/' + ver_id + '_fc.webp">'
		}
		html += '<div class="see_through_block m_5 m_t_10"><table class="music_scorelist_table collapse f_0"><tbody>';
		html += '<tr>' +				
				'<td class="col4 t_c"><img src="https://maimaidx-eng.com/maimai-mobile/img/icon_rand_dolly.png" class="h_25 m_3"></td>' +
				'<td class="col8 t_c"><img src="https://maimaidx-eng.com/maimai-mobile/img/music_icon_fc.png?ver=1.35"></td>' +
				'<td class="col8 t_c"><img src="https://maimaidx-eng.com/maimai-mobile/img/music_icon_sss.png?ver=1.35"></td>' +
				'<td class="col8 t_c"><img src="https://maimaidx-eng.com/maimai-mobile/img/music_icon_ap.png?ver=1.35"></td>' +
				'<td class="col8 t_c"><img src="https://maimaidx-eng.com/maimai-mobile/img/music_icon_fsd.png?ver=1.35"></td>' +
				'</tr>';
		for (var j = 0; j <= 4; j++) {
			songCount = fscores[fversions[i]][diff[j]].length;
			html += '<tr>' +
				'<td class="col4 t_c"><img src="https://maimaidx-eng.com/maimai-mobile/img/btn_music_' + diff[j].toLowerCase() + '.png" class="w_71"></td>' +
				'<td class="col8 t_c" style="background-color:white"><div class="f_14"><b>' + fscores[fversions[i]][diff[j]]['fcCount'] + '/' + songCount + '</b></div></td>' +
				'<td class="col8 t_c" style="background-color:white"><div class="f_14"><b>' + fscores[fversions[i]][diff[j]]['sssCount'] + '/' + songCount + '</b></div></td>' +
				'<td class="col8 t_c" style="background-color:white"><div class="f_14"><b>' + fscores[fversions[i]][diff[j]]['apCount'] + '/' + songCount + '</b></div></td>' +
				'<td class="col8 t_c" style="background-color:white"><div class="f_14"><b>' + fscores[fversions[i]][diff[j]]['fdxCount'] + '/' + songCount + '</b></div></td>' +
			'</tr>';
		}		
		html += '</tbody></table></div>';

		mainHtml += html;
	}

	mainHtml += '<br><p style="margin: 20px">Made by numbuh1</p><br><br><br>'

	$('.main_wrapper').html(mainHtml);
}

async function fetchScores(url) {
	dom = await fetchPage(url);
	songScore = [];
	scores = [];
	songs = $(dom.querySelectorAll('.w_450.m_15.p_3.f_0'));
	songData = [];
	playCount = 0;
	fcCount = 0;
	apCount = 0;
	sssCount = 0;
	fdxCount = 0;
	for (var i = 0; i < songs.length; i++) {
		currSong = songs[i];
		songData[i] = [];
		songData[i]['name'] = currSong.querySelector('.music_name_block').innerText;
		songData[i]['diff'] = currSong.querySelector('.music_lv_block').innerText;
		songData[i]['type'] = currSong.querySelector('.music_kind_icon').src.indexOf('standard') ? 'STD' : 'DX';
		type = currSong.querySelectorAll('.h_30.f_r');
		if(type.length) {
			songData[i]['play'] = 1;
			playCount++;

			if(type[0].src.indexOf('fsd') > 0) {
				songData[i]['fdx'] = 1;
				fdxCount++;
			}

			if(type[1].src.indexOf('ap') > 0) {
				songData[i]['fc'] = 1;
				songData[i]['ap'] = 1;
				fcCount++;
				apCount++;
			} else if(type[1].src.indexOf('fc') > 0) {
				songData[i]['fc'] = 1;
				fcCount++;
			}

			if(type[2].src.indexOf('sss') > 0) {
				songData[i]['sss'] = 1;
				sssCount++;
			}
		}
	}

	songData['playCount'] = playCount;
	songData['fcCount'] = fcCount;
	songData['apCount'] = apCount;
	songData['sssCount'] = sssCount;
	songData['fdxCount'] = fdxCount;

	return songData;
}