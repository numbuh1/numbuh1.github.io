fetchAllScores();
  
function fetchAllScores() {
  let pages = parseInt($('.board_paging button:last').attr('onclick').split('=')[2].split('\'')[0]);
  $('head').append( $('<link rel="stylesheet" type="text/css" />').attr('href', 'https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css') ); 
  $('#contents').css('background', '#1a1b1e');
  $('#header').remove();
  $('.pageWrap').html('');
  showProgress(pages);
  let scores = [];
  let current_url = window.location.href; 

  if(window.location.href.indexOf('?') == -1) {
    current_url = current_url + '?';
  }

  let mark = 1;
  for (var i = 1; i <= pages; i++) {
    fetchScores(current_url + '&&page=' + i)
      .then((score) => {
        console.log(mark + '/' + pages);
        $('#current_progress_page').html(mark);
        $('#fetch_progress_bar').css('width', ((mark/pages)*100) + '%');
        for (var j = score.length - 1; j >= 0; j--) {
          scores.push(score[j])
        }
        if(mark == pages) {
          $('#progress_pane').hide();
          run(scores)
        }
        mark++;
      });
  }
}


function run(scores) {
  scores.sort(function(a, b){
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

  createAnalytic(scores);
}

function showProgress(page) {
  $('.pageWrap').prepend('<div id="progress_pane"><h1 style="color:white">Fetching scores:</h1><div id="fetch_progress" class="progress" style="height: 30px;"></div>');
  $('#fetch_progress').append('<div id="fetch_progress_bar" class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" ' +
    'aria-valuenow="0" aria-valuemin="0" aria-valuemax="' + page + '" style="width: 0%">'+
    '<div style="position: absolute; text-align: center; line-height: 20px; overflow: hidden; color: black; right: 0; left: 0; top: 0;">'+
    '<span style="font-size: 20px;"><span id="current_progress_page">0</span>/' + page + '</span></div></div>');
}

function createAnalytic(scores) {
  console.log("Run Analytics"); 
  
  // Add Main Table
  $('.pageWrap').prepend('<div id="table_pane" class="row"><div id="table_pane_body" class="col-md-6"></div></div>');
  $('#table_pane_body').append('<h1 class="text-white">Score Rating</h1><hr><table id="main_table" class="table table-dark table-striped"></table>');
  $('#main_table').append('<thead class="thead-dark"><tr><th width="30">#</th><th>Song</th><th width="50">Diff</th><th width="100">Score</th><th width="50">Rank</th><th width="70">Rating</th></tr></thead>'); 
  $('#main_table').css('');
  $('#main_table').append('<tbody id="main_table_body"><tbody>');

  // Add Coop Table
  $('#table_pane_body').append('<h1 class="text-white">Coop Score Rating</h1><hr><table id="coop_table" class="table table-dark table-striped"></table>');
  $('#coop_table').append('<thead class="thead-dark"><tr><th width="30">#</th><th>Song</th><th width="50">Diff</th><th width="100">Score</th><th width="50">Rank</th><th width="70">Rating</th></tr></thead>');
  $('#coop_table').append('<tbody id="coop_table_body"><tbody>');

  var single_idx = 0;
  var coop_idx = 0;
  for (var i = 0; i < scores.length; i++) {
    switch(scores[i].score_rate) {
      case 'sss_p':
      case 'sss':
          score_style = 'style="font-weight: bolder; color: cyan;"';
          break;
      case 'ss_p':
      case 'ss':
      case 's_p':
      case 's':
          score_style = 'style="font-weight: bolder; color: gold;"';
          break;
      case 'aaa_p':
      case 'aaa':
        score_style = 'style="font-weight: bolder; color: silver;"';
        break;
        case 'aa_p':
        case 'aa':
        case 'a_p':
        case 'a':
        score_style = 'style="font-weight: bolder; color: orangered;"';
        break;
        default:
        score_style = 'style="font-weight: bolder; color: greenyellow;"';
    }
    switch(scores[i].level_type) {
      case 'single':
          level_style = 'style="font-weight: bolder; color: orangered;"';
          table_to_add = '#main_table_body';
          single_idx++;
          index = single_idx;
          break;
      case 'double':
          level_style = 'style="font-weight: bolder; color: lawngreen;"';
          table_to_add = '#main_table_body';
          single_idx++;
          index = single_idx;
          break;
      case 'coop':
        level_style = 'style="font-weight: bolder; color: yellow;"';
        table_to_add = '#coop_table_body'
        coop_idx++;
          index = coop_idx;
        break;
        default:
        level_style = '';
    }
    $(table_to_add).append('<tr>' +
      '<td><span class="mr-2">' + index + '</span></td>' +
      '<td>' + scores[i].name + '</td>' +
      '<td ' + level_style + '>' + scores[i].level_text + '</td>' +
      '<td>' + scores[i].score_text + '</td>' +
      '<td ' + score_style + '>' + scores[i].score_rate_text + '</td>' +
      '<td>' + scores[i].rating + '</td>');   
  }


  $('#table_pane').append('<div id="table_pane_progress" class="col-md-6"></div>');
  $('#table_pane_progress').append('<h1 class="text-white">Title Progress</h1><hr><table id="progress_table" class="table table-dark table-striped"></table>');
  $('#progress_table').append('<thead class="thead-dark"><tr><th width="180">Title</th><th width="180">Description</th><th>Progress</th></tr></thead>');
  $('#progress_table').append('<tbody id="progress_table_body"><tbody>');

  var level_progress = [];
  var level_progress_list = [];
  var score_progress = scores;
  score_progress.reduce(function(res, value) {
    if (!res[value.level]) {
        res[value.level] = { diff: value.level, rating: 0 };
        level_progress_list.push(res[value.level])
    }
    res[value.level].rating += parseInt(value.rating);
    return res;
  }, {});
  for (var i = 0; i < level_progress_list.length; i++) {
    level_progress[level_progress_list[i].diff] = level_progress_list[i].rating;
  }

  var skill_title_count = 0;
  var boss_title_count = 0;
  for (var i = 0; i < expert_titles.length; i++) {
    switch(expert_titles[i].tier) {
      case 'platinum':
          title_style = 'style="font-weight: bolder; color: cyan;"';
          break;
      case 'gold':
          title_style = 'style="font-weight: bolder; color: gold;"';
          break;
      case 'silver':
        title_style = 'style="font-weight: bolder; color: silver;"';
        break;
        case 'bronze':
        title_style = 'style="font-weight: bolder; color: orangered;"';
        break;
        default:
        title_style = '';
    }
    switch(expert_titles[i].type) {
      case 'rating':
        current_level = expert_titles[i].level;
        current_rating = level_progress[current_level] ? level_progress[current_level] : 0;
        max_rating = parseInt(expert_titles[i].rating);
        progress = Math.round((current_rating / max_rating) * 100);
        if(progress >= 100) {
          bar_bg = 'bg-success';
        } else {
          bar_bg = 'bg-danger';
        }
        $('#progress_table_body').append('<tr>' +
          '<td ' + title_style + '>' + expert_titles[i].name + '</td>' +
          '<td>' + expert_titles[i].description + '</td>' +
          '<td><div class="progress" style="position: relative;">' +
            '<div class="progress-bar ' + bar_bg + ' progress-bar-striped progress-bar-animated" role="progressbar"' +
              'aria-valuenow="' + current_rating + '" aria-valuemin="0" aria-valuemax="' + max_rating + '" style="width: ' + progress + '%"></div>' +
            '<div style="position: absolute; text-align: center; line-height: 20px; overflow: hidden; color: black; right: 0; left: 0; top: 0;">' + current_rating.toLocaleString() + '/' + max_rating.toLocaleString() + '</div>' +
          '</div></td></tr>');
          break;
      case 'skill_collect':
        $('#progress_table_body').append('<tr>' +
          '<td ' + title_style + '>' + expert_titles[i].name + '</td>' +
          '<td>' + expert_titles[i].description + '</td>' +
          '<td><div class="progress" style="position: relative;">' +
            '<div id="progress_bar_' + expert_titles[i].collect_type + '" class="progress-bar bg-danger progress-bar-striped progress-bar-animated" role="progressbar"' +
              'aria-valuenow="0" aria-valuemin="0" aria-valuemax="' + expert_titles[i].count + '" style="width: 0%"></div>' +
            '<div id="progress_bar_' + expert_titles[i].collect_type + '_text" style="position: absolute; text-align: center; line-height: 20px; overflow: hidden; color: black; right: 0; left: 0; top: 0;">0/' + expert_titles[i].count + '</div>' +
          '</div></td><tr><input type="hidden" id="skill_count_' + expert_titles[i].collect_type + '" value="0">');
        break;
      case 'skill':
        current_song = scores.find(o => o.name === expert_titles[i].song && o.level_text === expert_titles[i].diff);
        if(current_song == undefined) {
          current_song_score = 0;
          score_text = 0;
        } else {
          current_song_score = current_song.score;
          score_text = current_song.score_text;
        }
        progress = Math.round(parseInt(current_song_score) / 1000000 * 100);
        if(current_song_score > 990000) {         
          skill_title_count++;
          bar_bg = 'bg-success';

          skill_count = parseInt($('#skill_count_skill').val()) + 1;
          $('#skill_count_skill').val(skill_count);
          $('#progress_bar_skill').css('width', skill_count/60*100 + '%');
          $('#progress_bar_skill_text').html(skill_count + '/60');
          if(skill_count == 60) {
            $('#progress_bar_skill').removeClass('bg-danger');
            $('#progress_bar_skill').addClass('bg-success');
          }


          sub_skill_count = parseInt($('#skill_count_' + expert_titles[i].collect_type).val()) + 1;
          $('#skill_count_' + expert_titles[i].collect_type).val(sub_skill_count);
          $('#progress_bar_' + expert_titles[i].collect_type).css('width', sub_skill_count/10*100 + '%');
          $('#progress_bar_' + expert_titles[i].collect_type + '_text').html(sub_skill_count + '/10');
          if(sub_skill_count == 10) {
            $('#progress_bar_' + expert_titles[i].collect_type).removeClass('bg-danger');
            $('#progress_bar_' + expert_titles[i].collect_type).addClass('bg-success');
          }
        } else {
          bar_bg = 'bg-danger';
        }
        $('#progress_table_body').append('<tr>' +
          '<td ' + title_style + '>' + expert_titles[i].name + '</td>' +
          '<td>' + expert_titles[i].description + '</td>' +
          '<td><div class="progress" style="position: relative;">' +
            '<div class="progress-bar ' + bar_bg + ' progress-bar-striped progress-bar-animated" role="progressbar"' +
              'aria-valuenow="' + current_song_score + '" aria-valuemin="0" aria-valuemax="1000000" style="width: ' + progress + '%"></div>' +
            '<div style="position: absolute; text-align: center; line-height: 20px; overflow: hidden; color: black; right: 0; left: 0; top: 0;">' + score_text + '/1,000,000</div>' +
          '</div></td>');
        break;
      case 'boss':
        current_song = scores.find(o => o.name === expert_titles[i].song && o.level_text === expert_titles[i].diff);
        if(current_song == undefined) {
          current_song_score = 0;
          score_text = 0;
          bar_bg = 'bg-danger';
        } else {
          boss_title_count++;
          current_song_score = current_song.score;
          score_text = current_song.score_text;
          bar_bg = 'bg-success';
        }
        progress = Math.round(parseInt(current_song_score) / 1000000 * 100);
        $('#progress_table_body').append('<tr>' +
          '<td ' + title_style + '>' + expert_titles[i].name + '</td>' +
          '<td>' + expert_titles[i].description + '</td>' +
          '<td><div class="progress" style="position: relative;">' +
            '<div class="progress-bar ' + bar_bg + ' progress-bar-striped progress-bar-animated" role="progressbar"' +
              'aria-valuenow="' + current_song_score + '" aria-valuemin="0" aria-valuemax="1000000" style="width: ' + progress + '%"></div>' +
            '<div style="position: absolute; text-align: center; line-height: 20px; overflow: hidden; color: black; right: 0; left: 0; top: 0;">' + score_text + '/1,000,000</div>' +
          '</div></td>');
        break;
      default:
        continue;         
    }
  }

  scores.sort(SortByRating);

  // Add Stat images
  stat_css = `
  .summary_panel {
    z-index: 1;
      height: 175px;
      border-radius: 0.5em;
      position: relative;
      padding: 1em;
      border: 2px solid rgba(255,255,255,.8);
      overflow: hidden;
      flex: 1;
      display: flex;
      flex-direction: column;
      /* background: rgba(0,0,0,.75); */
      /* opacity: 0.6; */
      background-size: cover;
      background-position: center;
      font-weight: 700;
      font-size: 1em;
      font-family: 'Pretendard';
      margin: 10px;
  }

  .blur:before {
    content: '';
      background-color: #000;
      opacity: 0.7;
      width: 100%;
      height: 100%;
      z-index: 1;
      position: absolute;
      top: 0;
      left: 0;
      -webkit-filter: blur(1px) brightness(0.5);
      -moz-filter: blur(1px) brightness(0.5);
      -ms-filter: blur(1px) brightness(0.5);
      -o-filter: blur(1px) brightness(0.5);
      filter: blur(1px) brightness(0.5);
  }

  .badge-summary {
      font-size: x-large;
      line-height: 19px;
  }`

  var styleSheet = document.createElement("style")
  styleSheet.innerText = stat_css
  document.head.appendChild(styleSheet)

  $('.pageWrap').prepend('<div id="summary_pane"><h1 style="color:white">Summary</h1><table id="summary_table" class="table"></table></div><hr>');
  $('#summary_pane').append('<thead><tr><th id="summary_info" colspan="5"></th></tr></thead><tbody id="summary_detail"></tbody>');

  var single_song_scores = $.grep(scores, function(s) {
      return s.level_type != 'coop';
  });
  single_song_scores.sort(SortByRating);
  var max_all_rating = single_song_scores.length < 50 ? single_song_scores.length : 50;
  var items_per_row = 5;
  var panel_html;
  for (var i = 0; i < max_all_rating; i++) {
    if(i % 5 == 0) {
      panel_html += '<tr>';
    }

    song_name = single_song_scores[i].name;
    song_level_type = single_song_scores[i].level_type == 'single' ? 'danger' : 'success';
    song_level_text = single_song_scores[i].level_text;
    song_score_text = single_song_scores[i].score_text;
    song_score_rate_text = single_song_scores[i].score_rate_text;
    song_rating = single_song_scores[i].rating;
    bg_url = pump_bg[song_name];

    // var bg_url = 'https://piugame.com/data/song_img/1234e492a6a6edd6278007705181d137.png?v=20231221112906';
    panel_html += '<td><div class="blur summary_panel" style="background-image: url(' + bg_url + ');">'
            + '<div class="con con1" style="z-index: 3;"><div class="inn"><div class="song_name flex"><p style="margin-bottom: 0.25rem;color: white;text-overflow: ellipsis;white-space: nowrap;overflow: hidden;width: 200px; font-size: 20px;">'
            + song_name
            + '</p></div></div></div>'
            + '<div class="con con3" style="z-index: 3;margin-top: auto;"><div class="inn"><div class="tbl_w">'
                        + '<table width="100%" border="0" cellspacing="0" cellpadding="0" class="board_st ac recently_play">'
                        + '<tbody><tr style="vertical-align: bottom;">'
                        + '<td class="fontCol fontCol1" style="background: rgba(0,0,0,0) !important; text-align: left;padding: 0;">'
                        + '<div class="tx" style="font-weight: bold;font-size: 16px;">' + song_score_text + '</div></td>'
                        + '<td class="fontCol fontCol5" style="background: rgba(0,0,0,0) !important; text-align: right; padding: 0;">'
                        + '<div class="tx"><span class="badge badge-summary bg-' + song_level_type + '">' + song_level_text + '</span></div></td></tr>'
                        + '<tr style="vertical-align: bottom;">'
                        + '<td class="fontCol fontCol1" style="background: rgba(0,0,0,0) !important; text-align: left;padding: 0;">'
                        + '<div class="tx" style="font-size: 28px;"><img src="' + rating_image[song_score_rate_text] + '" style="height:40px"></div></td>'
            + '<td class="fontCol fontCol5" style="background: rgba(0,0,0,0) !important; text-align: right;padding: 0;">'
            + '<div class="tx" style="font-size: 38px;line-height: 28px;">' + song_rating + '</div></td></tr>'
                        + '</tbody></table></div></div></div></div></td>';

    if(i % 5 == 4 || i == max_all_rating - 1) {
      panel_html += '</tr>';
    }   
  }
  $('#summary_detail').append(panel_html);

  // Add Stat widgets
  $('.pageWrap').prepend('<div id="widget-pane" class="row"><h1 style="color:white">Stats</h1></div><hr>');

  var single_song_scores_single = $.grep(scores, function(s) {
      return s.level_type == 'single';
  });
  single_song_scores_single.sort(SortByRating);
  var single_song_scores_double = $.grep(scores, function(s) {
      return s.level_type == 'double';
  });
  single_song_scores_double.sort(SortByRating);

  var new_song_scores = $.grep(scores, function(s) {
      return new_songs.indexOf(s.name) >= 0 && s.level_type != 'coop';
  });
  new_song_scores.sort(SortByRating);
  var new_song_scores_single = $.grep(scores, function(s) {
      return new_songs.indexOf(s.name) >= 0 && s.level_type == 'single';
  });
  new_song_scores_single.sort(SortByRating);
  var new_song_scores_double = $.grep(scores, function(s) {
      return new_songs.indexOf(s.name) >= 0 && s.level_type == 'double';
  });
  new_song_scores_double.sort(SortByRating);

  var all_rating = 0;
  // var max_all_rating = single_song_scores.length < 50 ? single_song_scores.length : 50;
  for (var i = 0; i < max_all_rating; i++) {
    all_rating += single_song_scores[i].rating;
  }

  var all_rating_single = 0;
  var max_all_rating_single = single_song_scores_single.length < 50 ? single_song_scores_single.length : 50;
  for (var i = 0; i < max_all_rating_single; i++) {
    all_rating_single += single_song_scores_single[i].rating;
  }
  var all_rating_double = 0;
  var max_all_rating_double = single_song_scores_double.length < 50 ? single_song_scores_double.length : 50;
  for (var i = 0; i < max_all_rating_double; i++) {
    all_rating_double += single_song_scores_double[i].rating;
  }

  var new_rating = 0;
  var max_new_rating = new_song_scores.length < 20 ? new_song_scores.length : 20;
  for (var i = 0; i < max_new_rating; i++) {
    new_rating += new_song_scores[i].rating;
  }

  var new_rating_single = 0;
  var max_new_rating_single = new_song_scores_single.length < 20 ? new_song_scores_single.length : 20;
  for (var i = 0; i < max_new_rating_single; i++) {
    new_rating_single += new_song_scores_single[i].rating;
  }
  var new_rating_double = 0;
  var max_new_rating_double = new_song_scores_double.length < 20 ? new_song_scores_double.length : 20;
  for (var i = 0; i < max_new_rating_double; i++) {
    new_rating_double += new_song_scores_double[i].rating;
  }

  var max_skill_title_count = $.grep(expert_titles, function(s) {
      return s.type == 'skill';
  }).length;
  var max_boss_title_count = $.grep(expert_titles, function(s) {
      return s.type == 'boss';
  }).length;

  var widget_info = [
    {
      label: "All Time Rating",
      label_class: "bg-primary",
      score: all_rating.toLocaleString(),
      description: "Top 50 Score Rating"
    },
    {
      label: "All Time Rating (Single)",
      label_class: "bg-danger",
      score: all_rating_single.toLocaleString(),
      description: "Top 50 Score Rating (Single)"
    },
    {
      label: "All Time Rating (Double)",
      label_class: "bg-success",
      score: all_rating_double.toLocaleString(),
      description: "Top 50 Score Rating (Double)"
    },
    {
      label: "Skill Title Count",
      label_class: "bg-secondary",
      score: skill_title_count + '/' + max_skill_title_count,
      description: "Number of Skill titles"
    },
    {
      label: "New Song Rating",
      label_class: "bg-primary",
      score: new_rating.toLocaleString(),
      description: "Top 20 New Song Score Rating"
    },
    {
      label: "New Song Rating (Single)",
      label_class: "bg-danger",
      score: new_rating_single.toLocaleString(),
      description: "Top 20 New Song Score Rating (Single)"
    },
    {
      label: "New Song Rating (Double)",
      label_class: "bg-success",
      score: new_rating_double.toLocaleString(),
      description: "Top 20 New Song Score Rating (Double)"
    },
    {
      label: "Boss Breaker Title Count",
      label_class: "bg-secondary",
      score: boss_title_count + '/' + max_boss_title_count,
      description: "Number of Boss Breaker titles"
    }
  ]

  for (var i = 0; i < widget_info.length; i++) {
    let item = widget_info[i];
    $('#widget-pane').append('<div class="col-md-3" style="padding: 20px"><div class="card"><div class="card-body"><div class="lead"><span class="mb-1 badge badge-pill ' + item.label_class + '">' + item.label + '</span></div><h2 class="card-title">' + item.score + '</h2><p class="small text-muted">' + item.description + '</p></div></div></div>');
  }

  var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(scores));
  $('.pageWrap').prepend('<a href="data:' + data + '" class="btn btn-info" download="data.json">Download Scores</a><hr>');
}

function SortByRating(a, b){
  var aScore = a.rating;
  var bScore = b.rating; 
  return ((aScore > bScore) ? -1 : ((aScore > bScore) ? 1 : 0));
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

    if(level == 'xx' || level == 'x') {
      continue;
    } else {
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

const rating_text = {
  'sss_p': 'SSS+',
  'sss': 'SSS',
  'ss_p': 'SS+',
  'ss': 'SS',
  's_p': 'S+',
  's': 'S',
  'aaa_p': 'AAA+',
  'aaa': 'AAA',
  'aa_p': 'AA+',
  'aa': 'AA',
  'a_p': 'A+',
  'a': 'A',
  'b': 'B',
  'c': 'C',
  'd': 'D',
  'f': 'F',
};
const rating_image = {
  'SSS+':'https://piugame.com/l_img/grade/sss_p.png',
  'SSS':'https://piugame.com/l_img/grade/sss.png',
  'SS+':'https://piugame.com/l_img/grade/ss_p.png',
  'SS':'https://piugame.com/l_img/grade/ss.png',
  'S+':'https://piugame.com/l_img/grade/s_p.png',
  'S':'https://piugame.com/l_img/grade/s.png',
  'AAA+':'https://piugame.com/l_img/grade/aaa_p.png',
  'AAA':'https://piugame.com/l_img/grade/aaa.png',
  'AA+':'https://piugame.com/l_img/grade/aa_p.png',
  'AA':'https://piugame.com/l_img/grade/aa.png',
  'A+':'https://piugame.com/l_img/grade/a_p.png',
  'A':'https://piugame.com/l_img/grade/a.png',
  'B':'https://piugame.com/l_img/grade/b.png',
  'C':'https://piugame.com/l_img/grade/c.png',
  'D':'https://piugame.com/l_img/grade/d.png',
  'F':'https://piugame.com/l_img/grade/f.png',
};
const plate_text = {
  'pg': 'PERFECT GAME',
  'ug': 'ULTIMATE GAME',
  'eg': 'EXTREME GAME',
  'sg': 'SUPERB GAME',
  'mg': 'MARVELOUS GAME',
  'tg': 'TALENTED GAME',
  'fg': 'FAIR GAME',
  'rg': 'ROUGH GAME'
};
const expert_titles = [
  {name: 'THE MASTER',description: '[Lv.28] 1,900 rating',tier: 'platinum',type: 'rating',level: '28',rating: '1900'},
  {name: 'EXPERT Lv.10',description: '[Lv.27] 7,000 rating',tier: 'platinum',type: 'rating',level: '27',rating: '7000'},
  {name: 'EXPERT Lv.9',description: '[Lv.27] 3,500 rating',tier: 'gold',type: 'rating',level: '27',rating: '3500'},
  {name: 'EXPERT Lv.8',description: '[Lv.26] 26,000 rating',tier: 'gold',type: 'rating',level: '26',rating: '26000'},
  {name: 'EXPERT Lv.7',description: '[Lv.26] 13,000 rating',tier: 'gold',type: 'rating',level: '26',rating: '13000'},
  {name: 'EXPERT Lv.6',description: '[Lv.25] 40,000 rating',tier: 'gold',type: 'rating',level: '25',rating: '40000'},
  {name: 'EXPERT Lv.5',description: '[Lv.25] 20,000 rating',tier: 'gold',type: 'rating',level: '25',rating: '20000'},
  {name: 'EXPERT Lv.4',description: '[Lv.24] 60,000 rating',tier: 'gold',type: 'rating',level: '24',rating: '60000'},
  {name: 'EXPERT Lv.3',description: '[Lv.24] 30,000 rating',tier: 'gold',type: 'rating',level: '24',rating: '30000'},
  {name: 'EXPERT Lv.2',description: '[Lv.23] 80,000 rating',tier: 'gold',type: 'rating',level: '23',rating: '80000'},
  {name: 'EXPERT Lv.1',description: '[Lv.23] 40,000 rating',tier: 'gold',type: 'rating',level: '23',rating: '40000'},
  {name: 'ADVANCED Lv.10',description: '[Lv.22] 70,000 rating',tier: 'silver',type: 'rating',level: '22',rating: '70000'},
  {name: 'ADVANCED Lv.9',description: '[Lv.22] 52,500 rating',tier: 'silver',type: 'rating',level: '22',rating: '52500'},
  {name: 'ADVANCED Lv.8',description: '[Lv.22] 35,000 rating',tier: 'silver',type: 'rating',level: '22',rating: '35000'},
  {name: 'ADVANCED Lv.7',description: '[Lv.22] 17,500 rating',tier: 'silver',type: 'rating',level: '22',rating: '17500'},
  {name: 'ADVANCED Lv.6',description: '[Lv.21] 45,000 rating',tier: 'silver',type: 'rating',level: '21',rating: '45000'},
  {name: 'ADVANCED Lv.5',description: '[Lv.21] 30,000 rating',tier: 'silver',type: 'rating',level: '21',rating: '30000'},
  {name: 'ADVANCED Lv.4',description: '[Lv.21] 15,000 rating',tier: 'silver',type: 'rating',level: '21',rating: '15000'},
  {name: 'ADVANCED Lv.3',description: '[Lv.20] 39,000 rating',tier: 'silver',type: 'rating',level: '20',rating: '39000'},
  {name: 'ADVANCED Lv.2',description: '[Lv.20] 26,000 rating',tier: 'silver',type: 'rating',level: '20',rating: '26000'},
  {name: 'ADVANCED Lv.1',description: '[Lv.20] 13,000 rating',tier: 'silver',type: 'rating',level: '20',rating: '13000'},
  {name: 'INTERMEDIATE Lv.10',description: '[Lv.19] 11,000 rating',tier: 'bronze',type: 'rating',level: '19',rating: '11000'},
  {name: 'INTERMEDIATE Lv.9',description: '[Lv.18] 9,200 rating',tier: 'bronze',type: 'rating',level: '18',rating: '9200'},
  {name: 'INTERMEDIATE Lv.8',description: '[Lv.17] 7,600 rating',tier: 'bronze',type: 'rating',level: '17',rating: '7600'},
  {name: 'INTERMEDIATE Lv.7',description: '[Lv.16] 6,200 rating',tier: 'bronze',type: 'rating',level: '16',rating: '6200'},
  {name: 'INTERMEDIATE Lv.6',description: '[Lv.15] 5,000 rating',tier: 'bronze',type: 'rating',level: '15',rating: '5000'},
  {name: 'INTERMEDIATE Lv.5',description: '[Lv.14] 4,000 rating',tier: 'bronze',type: 'rating',level: '14',rating: '4000'},
  {name: 'INTERMEDIATE Lv.4',description: '[Lv.13] 3,200 rating',tier: 'bronze',type: 'rating',level: '13',rating: '3200'},
  {name: 'INTERMEDIATE Lv.3',description: '[Lv.12] 2,600 rating',tier: 'bronze',type: 'rating',level: '12',rating: '2600'},
  {name: 'INTERMEDIATE Lv.2',description: '[Lv.11] 2,200 rating',tier: 'bronze',type: 'rating',level: '11',rating: '2200'},
  {name: 'INTERMEDIATE Lv.1',description: '[Lv.10] 2,000 rating',tier: 'bronze',type: 'rating',level: '10',rating: '2000'},
  {name: 'SPECIALIST',description: 'All skill titles',tier: 'platinum',type: 'skill_collect',collect_type: 'skill',count: 60},
  {name: '[BRACKET] EXPERT',description: 'All Bracket titles',tier: 'platinum',type: 'skill_collect',collect_type: 'bracket',count: 10},
  {name: '[BRACKET] Lv.10',description: 'Phalanx D24',tier: 'platinum',type: 'skill',collect_type: 'bracket',song: 'Phalanx',diff: 'D24'},
  {name: '[BRACKET] Lv.9',description: 'Scorpion King D23',tier: 'platinum',type: 'skill',collect_type: 'bracket',song: 'Scorpion King',diff: 'D23'},
  {name: '[BRACKET] Lv.8',description: 'Pop Sequence D23',tier: 'gold',type: 'skill',collect_type: 'bracket',song: 'Pop Sequence',diff: 'D23'},
  {name: '[BRACKET] Lv.7',description: 'What Happened D23',tier: 'gold',type: 'skill',collect_type: 'bracket',song: 'What Happened',diff: 'D23'},
  {name: '[BRACKET] Lv.6',description: 'Meteo5cience D22',tier: 'silver',type: 'skill',collect_type: 'bracket',song: 'Meteo5cience (GADGET mix)',diff: 'D22'},
  {name: '[BRACKET] Lv.5',description: 'Phalanx S22',tier: 'silver',type: 'skill',collect_type: 'bracket',song: 'Phalanx',diff: 'S22'},
  {name: '[BRACKET] Lv.4',description: 'What Happened S21',tier: 'silver',type: 'skill',collect_type: 'bracket',song: 'What Happened',diff: 'S21'},
  {name: '[BRACKET] Lv.3',description: 'Meteo5cience D21',tier: 'bronze',type: 'skill',collect_type: 'bracket',song: 'Meteo5cience (GADGET mix)',diff: 'D21'},
  {name: '[BRACKET] Lv.2',description: 'Mad5cience S20',tier: 'bronze',type: 'skill',collect_type: 'bracket',song: 'Mad5cience',diff: 'S20'},
  {name: '[BRACKET] Lv.1',description: 'Allegro furioso D20',tier: 'bronze',type: 'skill',collect_type: 'bracket',song: 'Allegro furioso',diff: 'D20'},
  {name: '[HALF] EXPERT',description: 'All Half titles',tier: 'platinum',type: 'skill_collect',collect_type: 'half',count: 10},
  {name: '[HALF] Lv.10',description: 'Imprinting D24',tier: 'platinum',type: 'skill',collect_type: 'half',song: 'Imprinting',diff: 'D24'},
  {name: '[HALF] Lv.9',description: 'Love is a Danger Zone 2 Try To B.P.M D23',tier: 'platinum',type: 'skill',collect_type: 'half',song: 'Love is a Danger Zone 2 Try To B.P.M',diff: 'D23'},
  {name: '[HALF] Lv.8',description: 'Redline D22',tier: 'gold',type: 'skill',collect_type: 'half',song: 'Redline',diff: 'D22'},
  {name: '[HALF] Lv.7',description: 'Witch Doctor #1 D21',tier: 'gold',type: 'skill',collect_type: 'half',song: 'Witch Doctor #1',diff: 'D21'},
  {name: '[HALF] Lv.6',description: 'Utsushiyo No Kaze D20',tier: 'silver',type: 'skill',collect_type: 'half',song: 'Utsushiyo No Kaze feat. Kana',diff: 'D20'},
  {name: '[HALF] Lv.5',description: 'Phantom D19',tier: 'silver',type: 'skill',collect_type: 'half',song: 'Phantom',diff: 'D19'},
  {name: '[HALF] Lv.4',description: 'Super Fantasy D18',tier: 'silver',type: 'skill',collect_type: 'half',song: 'Super Fantasy',diff: 'D18'},
  {name: '[HALF] Lv.3',description: 'Shub Niggurath D18',tier: 'bronze',type: 'skill',collect_type: 'half',song: 'Shub Niggurath',diff: 'D18'},
  {name: '[HALF] Lv.2',description: 'Butterfly D17',tier: 'bronze',type: 'skill',collect_type: 'half',song: 'Butterfly',diff: 'D17'},
  {name: '[HALF] Lv.1',description: 'Mopemope D17',tier: 'bronze',type: 'skill',collect_type: 'half',song: 'Mopemope',diff: 'D17'},
  {name: '[GIMMICK] EXPERT',description: 'All Gimmick titles',tier: 'platinum',type: 'skill_collect',collect_type: 'gimmick',count: 10},
  {name: '[GIMMICK] Lv.10',description: 'Everybody Got 2 Know S21',tier: 'platinum',type: 'skill',collect_type: 'gimmick',song: 'Everybody Got 2 Know',diff: 'S21'},
  {name: '[GIMMICK] Lv.9',description: '8 6 S20',tier: 'platinum',type: 'skill',collect_type: 'gimmick',song: '8 6',diff: 'S20'},
  {name: '[GIMMICK] Lv.8',description: 'Twist of Fate (feat. Ruriling) S19',tier: 'gold',type: 'skill',collect_type: 'gimmick',song: 'Twist of Fate (feat. Ruriling)',diff: 'S19'},
  {name: '[GIMMICK] Lv.7',description: 'Nakakapagpabagabag S19',tier: 'gold',type: 'skill',collect_type: 'gimmick',song: 'Nakakapagpabagabag',diff: 'S19'},
  {name: '[GIMMICK] Lv.6',description: 'Miss S\' story S19',tier: 'silver',type: 'skill',collect_type: 'gimmick',song: 'Miss S\' story',diff: 'S19'},
  {name: '[GIMMICK] Lv.5',description: 'Rock the house - SHORT CUT - S18',tier: 'silver',type: 'skill',collect_type: 'gimmick',song: 'Rock the house - SHORT CUT -',diff: 'S18'},
  {name: '[GIMMICK] Lv.4',description: 'Come to Me S17',tier: 'silver',type: 'skill',collect_type: 'gimmick',song: 'Come to Me',diff: 'S17'},
  {name: '[GIMMICK] Lv.3',description: 'Ugly Dee S17',tier: 'bronze',type: 'skill',collect_type: 'gimmick',song: 'Ugly Dee',diff: 'S17'},
  {name: '[GIMMICK] Lv.2',description: '8 6 S16',tier: 'bronze',type: 'skill',collect_type: 'gimmick',song: '8 6',diff: 'S16'},
  {name: '[GIMMICK] Lv.1',description: 'Yeo rae a S13',tier: 'bronze',type: 'skill',collect_type: 'gimmick',song: 'Yeo rae a',diff: 'S13'},
  {name: '[DRILL] EXPERT',description: 'All Drill titles',tier: 'platinum',type: 'skill_collect',collect_type: 'drill',count: 10},
  {name: '[DRILL] Lv.10',description: 'WI-EX-DOC-VA D24',tier: 'platinum',type: 'skill',collect_type: 'drill',song: 'WI-EX-DOC-VA',diff: 'D24'},
  {name: '[DRILL] Lv.9',description: 'Witch Doctor D23',tier: 'platinum',type: 'skill',collect_type: 'drill',song: 'Witch Doctor',diff: 'D23'},
  {name: '[DRILL] Lv.8',description: 'Rock the house D22',tier: 'gold',type: 'skill',collect_type: 'drill',song: 'Rock the house',diff: 'D22'},
  {name: '[DRILL] Lv.7',description: 'Sorceress Elise S21',tier: 'gold',type: 'skill',collect_type: 'drill',song: 'Sorceress Elise',diff: 'S21'},
  {name: '[DRILL] Lv.6',description: 'Overblow S20',tier: 'silver',type: 'skill',collect_type: 'drill',song: 'Overblow',diff: 'S20'},
  {name: '[DRILL] Lv.5',description: 'Vacuum S19',tier: 'silver',type: 'skill',collect_type: 'drill',song: 'Vacuum',diff: 'S19'},
  {name: '[DRILL] Lv.4',description: 'Moonlight S18',tier: 'silver',type: 'skill',collect_type: 'drill',song: 'Moonlight',diff: 'S18'},
  {name: '[DRILL] Lv.3',description: 'Gun Rock S17',tier: 'bronze',type: 'skill',collect_type: 'drill',song: 'Gun Rock',diff: 'S17'},
  {name: '[DRILL] Lv.2',description: 'Vook S16',tier: 'bronze',type: 'skill',collect_type: 'drill',song: 'Vook',diff: 'S16'},
  {name: '[DRILL] Lv.1',description: 'Hellfire S13',tier: 'bronze',type: 'skill',collect_type: 'drill',song: 'Hellfire',diff: 'S13'},
  {name: '[RUN] EXPERT',description: 'All Run titles',tier: 'platinum',type: 'skill_collect',collect_type: 'run',count: 10},
  {name: '[RUN] Lv.10',description: 'Yog-Sothoth D24',tier: 'platinum',type: 'skill',collect_type: 'run',song: 'Yog-Sothoth',diff: 'D24'},
  {name: '[RUN] Lv.9',description: 'Baroque Virus - FULL SONG - D23',tier: 'platinum',type: 'skill',collect_type: 'run',song: 'Baroque Virus - FULL SONG -',diff: 'D23'},
  {name: '[RUN] Lv.8',description: 'Gargoyle - FULL SONG - D22',tier: 'gold',type: 'skill',collect_type: 'run',song: 'Gargoyle - FULL SONG -',diff: 'D22'},
  {name: '[RUN] Lv.7',description: 'Sarabande D21',tier: 'gold',type: 'skill',collect_type: 'run',song: 'Sarabande',diff: 'D21'},
  {name: '[RUN] Lv.6',description: 'Bee D20',tier: 'silver',type: 'skill',collect_type: 'run',song: 'Bee',diff: 'D20'},
  {name: '[RUN] Lv.5',description: 'Napalm S19',tier: 'silver',type: 'skill',collect_type: 'run',song: 'Napalm',diff: 'S19'},
  {name: '[RUN] Lv.4',description: 'Gothique Resonance S18',tier: 'silver',type: 'skill',collect_type: 'run',song: 'Gothique Resonance',diff: 'S18'},
  {name: '[RUN] Lv.3',description: 'Pavane S17',tier: 'bronze',type: 'skill',collect_type: 'run',song: 'Pavane',diff: 'S17'},
  {name: '[RUN] Lv.2',description: 'Super Fantasy S16',tier: 'bronze',type: 'skill',collect_type: 'run',song: 'Super Fantasy',diff: 'S16'},
  {name: '[RUN] Lv.1',description: 'Switronic S13',tier: 'bronze',type: 'skill',collect_type: 'run',song: 'Switronic',diff: 'S13'},
  {name: '[TWIST] EXPERT',description: 'All Twist titles',tier: 'platinum',type: 'skill_collect',collect_type: 'twist',count: 10},
  {name: '[TWIST] Lv.10',description: 'Bee D24',tier: 'platinum',type: 'skill',collect_type: 'twist',song: 'Bee',diff: 'D24'},
  {name: '[TWIST] Lv.9',description: 'Love Is A Danger Zone(Cranky Mix) D23',tier: 'platinum',type: 'skill',collect_type: 'twist',song: 'Love Is A Danger Zone(Cranky Mix)',diff: 'D23'},
  {name: '[TWIST] Lv.8',description: 'Super Fantasy D22',tier: 'gold',type: 'skill',collect_type: 'twist',song: 'Super Fantasy',diff: 'D22'},
  {name: '[TWIST] Lv.7',description: 'Love is a Danger Zone D21',tier: 'gold',type: 'skill',collect_type: 'twist',song: 'Love is a Danger Zone',diff: 'D21'},
  {name: '[TWIST] Lv.6',description: 'Witch Doctor #1 D20',tier: 'silver',type: 'skill',collect_type: 'twist',song: 'Witch Doctor #1',diff: 'D20'},
  {name: '[TWIST] Lv.5',description: 'U GOT 2 KNOW S19',tier: 'silver',type: 'skill',collect_type: 'twist',song: 'U GOT 2 KNOW',diff: 'S19'},
  {name: '[TWIST] Lv.4',description: 'Solitary 2 S18',tier: 'silver',type: 'skill',collect_type: 'twist',song: 'Solitary 2',diff: 'S18'},
  {name: '[TWIST] Lv.3',description: 'U Got Me Rocking S17',tier: 'bronze',type: 'skill',collect_type: 'twist',song: 'U Got Me Rocking',diff: 'S17'},
  {name: '[TWIST] Lv.2',description: 'Street show down S16',tier: 'bronze',type: 'skill',collect_type: 'twist',song: 'Street show down',diff: 'S16'},
  {name: '[TWIST] Lv.1',description: 'Scorpion King S13',tier: 'bronze',type: 'skill',collect_type: 'twist',song: 'Scorpion King',diff: 'S13'},
  {name: '[XX] Double',description: '1949 D28',tier: 'platinum',type: 'boss',song: '1949',diff: 'D28'},
  {name: '[XX] Single',description: 'ERRORCODE: 0 S25',tier: 'gold',type: 'boss',song: 'ERRORCODE: 0',diff: 'S25'},
  {name: '[PRIME2] Double',description: 'Shub Sothoth D27',tier: 'platinum',type: 'boss',song: 'Shub Sothoth',diff: 'D27'},
  {name: '[PRIME2] Single',description: 'Shub Sothoth S25',tier: 'gold',type: 'boss',song: 'Shub Sothoth',diff: 'S25'},
  {name: '[PRIME] Double',description: 'Paradoxx D28',tier: 'platinum',type: 'boss',song: 'Paradoxx',diff: 'D28'},
  {name: '[PRIME] Single',description: 'Paradoxx S26',tier: 'gold',type: 'boss',song: 'Paradoxx',diff: 'S26'},
  {name: '[FIESTA2] Double',description: 'Ignis Fatuus D25',tier: 'gold',type: 'boss',song: 'Ignis Fatuus',diff: 'D25'},
  {name: '[FIESTA2] Single',description: 'Ignis Fatuus S22',tier: 'silver',type: 'boss',song: 'Ignis Fatuus',diff: 'S22'},
  {name: '[FIESTA EX] Double',description: 'Vacuum Cleaner D26',tier: 'gold',type: 'boss',song: 'Vacuum Cleaner',diff: 'D26'},
  {name: '[FIESTA EX] Single',description: 'Vacuum Cleaner S25',tier: 'gold',type: 'boss',song: 'Vacuum Cleaner',diff: 'S25'},
  {name: '[FIESTA] Double',description: 'Vacuum D25',tier: 'gold',type: 'boss',song: 'Vacuum',diff: 'D25'},
  {name: '[FIESTA] Single',description: 'Vacuum S23',tier: 'silver',type: 'boss',song: 'Vacuum',diff: 'S23'},
  {name: '[NXA] Double',description: 'Final Audition Ep. 2-X D24',tier: 'gold',type: 'boss',song: 'Final Audition Ep. 2-X',diff: 'D24'},
  {name: '[NXA] Single',description: 'Final Audition Ep. 2-X S23',tier: 'silver',type: 'boss',song: 'Final Audition Ep. 2-X',diff: 'S23'},
  {name: '[NX2] Double',description: 'Banya-P Guitar Remix D24',tier: 'gold',type: 'boss',song: 'Banya-P Guitar Remix',diff: 'D24'},
  {name: '[NX2] Single',description: 'Banya-P Guitar Remix S22',tier: 'silver',type: 'boss',song: 'Banya-P Guitar Remix',diff: 'S22'},
  {name: '[NX] Double',description: 'Bemera D26',tier: 'gold',type: 'boss',song: 'Bemera',diff: 'D26'},
  {name: '[NX] Single',description: 'Bemera S24',tier: 'silver',type: 'boss',song: 'Bemera',diff: 'S24'},
  {name: '[ZERO] Double',description: 'Love is a Danger Zone pt. 2 D24',tier: 'silver',type: 'boss',song: 'Love is a Danger Zone pt. 2',diff: 'D24'},
  {name: '[ZERO] Single',description: 'Love is a Danger Zone pt. 2 S22',tier: 'silver',type: 'boss',song: 'Love is a Danger Zone pt. 2',diff: 'S22'},
  {name: '[EXCEED2] Double',description: 'Canon D D23',tier: 'silver',type: 'boss',song: 'Canon D',diff: 'D23'},
  {name: '[EXCEED2] Single',description: 'Canon D S20',tier: 'silver',type: 'boss',song: 'Canon D',diff: 'S20'},
  {name: '[EXCEED] Double',description: 'Dignity D24',tier: 'gold',type: 'boss',song: 'Dignity',diff: 'D24'},
  {name: '[EXCEED] Single',description: 'Dignity S21',tier: 'silver',type: 'boss',song: 'Dignity',diff: 'S21'},
  {name: '[THE PREX3]',description: 'Bee S17',tier: 'bronze',type: 'boss',song: 'Bee',diff: 'S17'},
  {name: '[THE REBIRTH]',description: 'Love is a Danger Zone S17',tier: 'bronze',type: 'boss',song: 'Love is a Danger Zone',diff: 'S17'},
  {name: '[EXTRA]',description: 'Radetzky Can Can D18',tier: 'bronze',type: 'boss',song: 'Radetzky Can Can',diff: 'D18'},
  {name: '[Perfect Collection]',description: 'Slam S18',tier: 'bronze',type: 'boss',song: 'Slam',diff: 'S18'},
  {name: '[The O.B.G SE]',description: 'Mr. Larpus S15',tier: 'bronze',type: 'boss',song: 'Mr. Larpus',diff: 'S15'},
  {name: '[The O.B.G]',description: 'Turkey March S12',tier: 'bronze',type: 'boss',song: 'Turkey March',diff: 'S12'},
  {name: '[The 2nd]',description: 'Extravaganza S11',tier: 'bronze',type: 'boss',song: 'Extravaganza',diff: 'S11'},
  {name: '[The 1st]',description: 'Another Truth S6',tier: 'bronze',type: 'boss',song: 'Another Truth',diff: 'S06'},
];
const new_songs = [
  "Pirate","Airplane","STORM","Beautiful Liar","After LIKE","Amor Fati","Alone","Teddy Bear","Nxde","BOCA","BATTLE NO.1","R.I.P","GOODBOUNCE","Halcyon","Altale","Pneumonoultramicroscopicsilicovolcanoconiosis ft. Kagamine Len/GUMI","Acquire","MilK","Energy Synergy Matrix","CO5M1C R4ILR0AD","GOODTEK","Lohxia","CHAOS AGAIN","MURDOCH","Ghroth","KUGUTSU","BOOOM!!","Etude Op 10-4","Jupin","Euphorianic","Showdown","Versailles","VECTOR","WHISPER","Halloween Party ~Multiverse~","Lacrimosa","Galaxy Collapse","Euphorianic - SHORT CUT -","ELEVEN","Neo Catharsis","Barber's Madness","Aragami","Viyella's Nightmare","Spray","Yo! Say!! Fairy!!!","Curiosity Overdrive","iRELLiA","PUPA","TOMBOY","PANDORA","Bluish Rose","Flavor Step!","TRICKL4SH 220","See","Sudden Appearance Image","Simon Says, EURODANCE!! (feat. Sara☆M)","Little Munchkin","STAGER"
]
const pump_bg = {
  "All I Want For X-mas":"https://pumpout2020.anyhowstep.com/img/card/20.png",
  "Rolling Christmas":"https://pumpout2020.anyhowstep.com/img/card/19.png",
  "Beethoven Virus":"https://pumpout2020.anyhowstep.com/img/card/21.png",
  "Solitary":"https://pumpout2020.anyhowstep.com/img/card/16.png",
  "Hestia":"https://pumpout2020.anyhowstep.com/img/card/364.png",
  "Mr. Larpus":"https://pumpout2020.anyhowstep.com/img/card/17.png",
  "Final Audition 2":"https://pumpout2020.anyhowstep.com/img/card/10.png",
  "Naissance":"https://pumpout2020.anyhowstep.com/img/card/11.png",
  "Turkey March":"https://pumpout2020.anyhowstep.com/img/card/12.png",
  "Midnight Blue":"https://pumpout2020.anyhowstep.com/img/card/13.png",
  "Final Audition":"https://pumpout2020.anyhowstep.com/img/card/5.png",
  "Extravaganza":"https://pumpout2020.anyhowstep.com/img/card/6.png",
  "Repeatorment Remix":"https://pumpout2020.anyhowstep.com/img/card/9.png",
  "Ignition Starts":"https://pumpout2020.anyhowstep.com/img/card/1.png",
  "Hypnosis":"https://pumpout2020.anyhowstep.com/img/card/2.png",
  "Slam":"https://pumpout2020.anyhowstep.com/img/card/22.png",
  "Run to you":"https://pumpout2020.anyhowstep.com/img/card/18.png",
  "Caution":"https://pumpout2020.anyhowstep.com/img/card/14.png",
  "We Are":"https://pumpout2020.anyhowstep.com/img/card/15.png",
  "Com'Back":"https://pumpout2020.anyhowstep.com/img/card/7.png",
  "Mobius Strip":"https://pumpout2020.anyhowstep.com/img/card/8.png",
  "Funky Tonight":"https://pumpout2020.anyhowstep.com/img/card/3.png",
  "Another Truth":"https://pumpout2020.anyhowstep.com/img/card/4.png",
  "Bee":"https://pumpout2020.anyhowstep.com/img/card/37.png",
  "Beat of The War":"https://pumpout2020.anyhowstep.com/img/card/38.png",
  "Come to Me":"https://pumpout2020.anyhowstep.com/img/card/39.png",
  "Dr. M":"https://pumpout2020.anyhowstep.com/img/card/23.png",
  "Emperor":"https://pumpout2020.anyhowstep.com/img/card/24.png",
  "Love is a Danger Zone":"https://pumpout2020.anyhowstep.com/img/card/25.png",
  "Maria":"https://pumpout2020.anyhowstep.com/img/card/26.png",
  "My Way":"https://pumpout2020.anyhowstep.com/img/card/27.png",
  "Point Break":"https://pumpout2020.anyhowstep.com/img/card/28.png",
  "Winter":"https://pumpout2020.anyhowstep.com/img/card/29.png",
  "Will-O-The-Wisp":"https://pumpout2020.anyhowstep.com/img/card/30.png",
  "Till the end of time":"https://pumpout2020.anyhowstep.com/img/card/31.png",
  "Oy Oy Oy":"https://pumpout2020.anyhowstep.com/img/card/32.png",
  "Set me up":"https://pumpout2020.anyhowstep.com/img/card/33.png",
  "Dance with me":"https://pumpout2020.anyhowstep.com/img/card/34.png",
  "Vook":"https://pumpout2020.anyhowstep.com/img/card/35.png",
  "Csikos Post":"https://pumpout2020.anyhowstep.com/img/card/36.png",
  "Chicken Wing":"https://pumpout2020.anyhowstep.com/img/card/42.png",
  "Final Audition Ep. 1":"https://pumpout2020.anyhowstep.com/img/card/43.png",
  "EXTRA BanYa Remix":"https://pumpout2020.anyhowstep.com/img/card/337.png",
  "Starian":"https://pumpout2020.anyhowstep.com/img/card/40.png",
  "Guilty Conscience":"https://pumpout2020.anyhowstep.com/img/card/41.png",
  "Beat of The War 2":"https://pumpout2020.anyhowstep.com/img/card/257.png",
  "Moonlight":"https://pumpout2020.anyhowstep.com/img/card/258.png",
  "Witch Doctor":"https://pumpout2020.anyhowstep.com/img/card/259.png",
  "Love is a Danger Zone pt. 2":"https://pumpout2020.anyhowstep.com/img/card/260.png",
  "Phantom":"https://pumpout2020.anyhowstep.com/img/card/261.png",
  "Papa Gonzales":"https://pumpout2020.anyhowstep.com/img/card/262.png",
  "Love is a Danger Zone 2 Try To B.P.M":"https://pumpout2020.anyhowstep.com/img/card/264.png",
  "Love is a Danger Zone pt.2 another":"https://pumpout2020.anyhowstep.com/img/card/279.png",
  "J Bong":"https://pumpout2020.anyhowstep.com/img/card/248.png",
  "Hi Bi":"https://pumpout2020.anyhowstep.com/img/card/249.png",
  "Solitary 2":"https://pumpout2020.anyhowstep.com/img/card/250.png",
  "Canon D":"https://pumpout2020.anyhowstep.com/img/card/251.png",
  "Tream Vook of the war REMIX":"https://pumpout2020.anyhowstep.com/img/card/252.png",
  "Banya Classic Remix":"https://pumpout2020.anyhowstep.com/img/card/253.png",
  "BANYA HIPHOP REMIX":"https://pumpout2020.anyhowstep.com/img/card/255.png",
  "Canon D - FULL SONG -":"https://pumpout2020.anyhowstep.com/img/card/256.png",
  "Final Audition 3":"https://pumpout2020.anyhowstep.com/img/card/235.png",
  "Naissance 2":"https://pumpout2020.anyhowstep.com/img/card/236.png",
  "Monkey Fingers":"https://pumpout2020.anyhowstep.com/img/card/237.png",
  "Blazing":"https://pumpout2020.anyhowstep.com/img/card/238.png",
  "Pump me Amadeus":"https://pumpout2020.anyhowstep.com/img/card/239.png",
  "X Treme":"https://pumpout2020.anyhowstep.com/img/card/240.png",
  "Get Up!":"https://pumpout2020.anyhowstep.com/img/card/241.png",
  "Chung Hwa Ban Jeom":"https://pumpout2020.anyhowstep.com/img/card/263.png",
  "HOT":"https://pumpout2020.anyhowstep.com/img/card/244.png",
  "Deja Vu":"https://pumpout2020.anyhowstep.com/img/card/245.png",
  "Harangue":"https://pumpout2020.anyhowstep.com/img/card/246.png",
  "I'll Give You All My Love":"https://pumpout2020.anyhowstep.com/img/card/247.png",
  "DIGNITY FULL SONG MIX":"https://pumpout2020.anyhowstep.com/img/card/254.png",
  "Dignity":"https://pumpout2020.anyhowstep.com/img/card/242.png",
  "What Do You Really Want?":"https://pumpout2020.anyhowstep.com/img/card/243.png",
  "Blaze Emotion":"https://pumpout2020.anyhowstep.com/img/card/338.png",
  "Cannon X.1":"https://pumpout2020.anyhowstep.com/img/card/339.png",
  "Chopsticks Challenge":"https://pumpout2020.anyhowstep.com/img/card/340.png",
  "The People didn't know":"https://pumpout2020.anyhowstep.com/img/card/344.png",
  "DJ Otada":"https://pumpout2020.anyhowstep.com/img/card/345.png",
  "K.O.A : Alice In Wonderworld":"https://pumpout2020.anyhowstep.com/img/card/346.png",
  "My Dreams":"https://pumpout2020.anyhowstep.com/img/card/347.png",
  "Toccata":"https://pumpout2020.anyhowstep.com/img/card/348.png",
  "Final Audition Ep. 2-X":"https://pumpout2020.anyhowstep.com/img/card/350.png",
  "The People didn't know Pumping up":"https://pumpout2020.anyhowstep.com/img/card/351.png",
  "Caprice of DJ Otada":"https://pumpout2020.anyhowstep.com/img/card/352.png",
  "Dr. KOA":"https://pumpout2020.anyhowstep.com/img/card/353.png",
  "Chopsticks Challenge - FULL SONG -":"https://pumpout2020.anyhowstep.com/img/card/356.png",
  "Pumptris 8Bit ver.":"https://pumpout2020.anyhowstep.com/img/card/362.png",
  "Solitary 1.5":"https://pumpout2020.anyhowstep.com/img/card/325.png",
  "Beat The Ghost":"https://pumpout2020.anyhowstep.com/img/card/326.png",
  "Caprice of Otada":"https://pumpout2020.anyhowstep.com/img/card/327.png",
  "Monkey Fingers 2":"https://pumpout2020.anyhowstep.com/img/card/328.png",
  "Faster Z":"https://pumpout2020.anyhowstep.com/img/card/329.png",
  "Pumptris Quattro":"https://pumpout2020.anyhowstep.com/img/card/330.png",
  "Higgledy Piggledy":"https://pumpout2020.anyhowstep.com/img/card/332.png",
  "Banya-P Guitar  Remix":"https://pumpout2020.anyhowstep.com/img/card/336.png",
  "Witch Doctor #1":"https://pumpout2020.anyhowstep.com/img/card/265.png",
  "Arch of Darkness":"https://pumpout2020.anyhowstep.com/img/card/266.png",
  "Chimera":"https://pumpout2020.anyhowstep.com/img/card/267.png",
  "Do U Know That-Old School":"https://pumpout2020.anyhowstep.com/img/card/268.png",
  "Gun Rock":"https://pumpout2020.anyhowstep.com/img/card/269.png",
  "Bullfighter's Song":"https://pumpout2020.anyhowstep.com/img/card/270.png",
  "Ugly Dee":"https://pumpout2020.anyhowstep.com/img/card/271.png",
  "Final Audition Ep. 2-1":"https://pumpout2020.anyhowstep.com/img/card/272.png",
  "Final Audition Ep. 2-2":"https://pumpout2020.anyhowstep.com/img/card/273.png",
  "WI-EX-DOC-VA":"https://pumpout2020.anyhowstep.com/img/card/275.png",
  "BEMERA":"https://pumpout2020.anyhowstep.com/img/card/276.png",
  "Love is a Danger Zone 2 - FULL SONG -":"https://pumpout2020.anyhowstep.com/img/card/277.png",
  "Beat of the War 2 - FULL SONG -":"https://pumpout2020.anyhowstep.com/img/card/278.png",
  "Dawn of the Apocalypse":"https://pumpout2020.anyhowstep.com/img/card/349.png",
  "Beat # No.4":"https://pumpout2020.anyhowstep.com/img/card/361.png",
  "Beat # No.4":"https://pumpout2020.anyhowstep.com/img/card/331.png",
  "Groove Party":"https://pumpout2020.anyhowstep.com/img/card/274.png",
  "Panuelito Rojo":"https://pumpout2020.anyhowstep.com/img/card/341.png",
  "Procedimientos Para Llegar A Un Comun Acuerdo":"https://pumpout2020.anyhowstep.com/img/card/342.png",
  "Digan Lo Que Digan":"https://pumpout2020.anyhowstep.com/img/card/343.png",
  "Nina PXNDX Mix":"https://pumpout2020.anyhowstep.com/img/card/354.png",
  "Big metra Remix":"https://pumpout2020.anyhowstep.com/img/card/355.png",
  "Panuelito Rojo":"https://pumpout2020.anyhowstep.com/img/card/357.png",
  "Procedimientos Para Llegar A Un Comun Acuerdo":"https://pumpout2020.anyhowstep.com/img/card/358.png",
  "Digan Lo Que Digan":"https://pumpout2020.anyhowstep.com/img/card/359.png",
  "Trato De No Trabarme":"https://pumpout2020.anyhowstep.com/img/card/360.png",
  "Dance All Night":"https://pumpout2020.anyhowstep.com/img/card/333.png",
  "Dance Vibrations":"https://pumpout2020.anyhowstep.com/img/card/334.png",
  "Energizer":"https://pumpout2020.anyhowstep.com/img/card/335.png",
  "XTREE":"https://pumpout2020.anyhowstep.com/img/card/44.png",
  "Sorceress Elise":"https://pumpout2020.anyhowstep.com/img/card/45.png",
  "U Got 2 Know":"https://pumpout2020.anyhowstep.com/img/card/46.png",
  "Destination":"https://pumpout2020.anyhowstep.com/img/card/47.png",
  "Vacuum":"https://pumpout2020.anyhowstep.com/img/card/48.png",
  "Xenesis":"https://pumpout2020.anyhowstep.com/img/card/50.png",
  "Arirang":"https://pumpout2020.anyhowstep.com/img/card/51.png",
  "Tek -Club Copenhagen-":"https://pumpout2020.anyhowstep.com/img/card/52.png",
  "Hello William":"https://pumpout2020.anyhowstep.com/img/card/53.png",
  "Turkey March -Minimal Tunes-":"https://pumpout2020.anyhowstep.com/img/card/54.png",
  "Get Up (and go)":"https://pumpout2020.anyhowstep.com/img/card/55.png",
  "Phantom -Intermezzo-":"https://pumpout2020.anyhowstep.com/img/card/56.png",
  "B.P Classic Remix":"https://pumpout2020.anyhowstep.com/img/card/57.png",
  "PaPa helloizing":"https://pumpout2020.anyhowstep.com/img/card/58.png",
  "B.P Classic Remix 2":"https://pumpout2020.anyhowstep.com/img/card/59.png",
  "Hard Core Rock Mix":"https://pumpout2020.anyhowstep.com/img/card/60.png",
  "Set Up Me2 Mix":"https://pumpout2020.anyhowstep.com/img/card/61.png",
  "msgoon RMX pt.6":"https://pumpout2020.anyhowstep.com/img/card/62.png",
  "Final Audition 2 - SHORT CUT -":"https://pumpout2020.anyhowstep.com/img/card/66.png",
  "Final Audition 3 - SHORT CUT -":"https://pumpout2020.anyhowstep.com/img/card/67.png",
  "Final Audition EP. 2-X - SHORT CUT -":"https://pumpout2020.anyhowstep.com/img/card/68.png",
  "Love is a Danger Zone - SHORT CUT -":"https://pumpout2020.anyhowstep.com/img/card/69.png",
  "Love is a Danger Zone pt. 2 - SHORT CUT -":"https://pumpout2020.anyhowstep.com/img/card/70.png",
  "Extravaganza - SHORT CUT -":"https://pumpout2020.anyhowstep.com/img/card/71.png",
  "CHICKEN WING - SHORT CUT -":"https://pumpout2020.anyhowstep.com/img/card/72.png",
  "Winter - SHORT CUT -":"https://pumpout2020.anyhowstep.com/img/card/73.png",
  "Solitary 2 - SHORT CUT -":"https://pumpout2020.anyhowstep.com/img/card/74.png",
  "Moonlight - SHORT CUT -":"https://pumpout2020.anyhowstep.com/img/card/75.png",
  "Witch Doctor - SHORT CUT -":"https://pumpout2020.anyhowstep.com/img/card/76.png",
  "Exceed2 Opening":"https://pumpout2020.anyhowstep.com/img/card/77.png",
  "NX Opening":"https://pumpout2020.anyhowstep.com/img/card/78.png",
  "K.O.A : Alice in Wonderworld - SHORT CUT -":"https://pumpout2020.anyhowstep.com/img/card/79.png",
  "Bemera - SHORT CUT -":"https://pumpout2020.anyhowstep.com/img/card/80.png",
  "Pumptris 8Bit ver. - SHORT CUT -":"https://pumpout2020.anyhowstep.com/img/card/81.png",
  "Destination - SHORT CUT -":"https://pumpout2020.anyhowstep.com/img/card/82.png",
  "Tepris":"https://pumpout2020.anyhowstep.com/img/card/84.png",
  "Napalm":"https://pumpout2020.anyhowstep.com/img/card/85.png",
  "Deja Vu":"https://pumpout2020.anyhowstep.com/img/card/63.png",
  "Dawn of the Apocalypse":"https://pumpout2020.anyhowstep.com/img/card/65.png",
  "NARCISISTA POR EXCELENCIA":"https://pumpout2020.anyhowstep.com/img/card/49.png",
  "NARCISISTA POR EXCELENCIA - SHORT CUT -":"https://pumpout2020.anyhowstep.com/img/card/64.png",
  "Procedimientos Para Llegar A Un Comun Acuerdo":"https://pumpout2020.anyhowstep.com/img/card/83.png",
  "Dieciseis":"https://pumpout2020.anyhowstep.com/img/card/86.png",
  "Cleaner":"https://pumpout2020.anyhowstep.com/img/card/87.png",
  "Interference":"https://pumpout2020.anyhowstep.com/img/card/88.png",
  "Reality":"https://pumpout2020.anyhowstep.com/img/card/89.png",
  "Take Out":"https://pumpout2020.anyhowstep.com/img/card/90.png",
  "Butterfly":"https://pumpout2020.anyhowstep.com/img/card/91.png",
  "Overblow":"https://pumpout2020.anyhowstep.com/img/card/92.png",
  "We Got 2 Know":"https://pumpout2020.anyhowstep.com/img/card/93.png",
  "Hungarian Dance V":"https://pumpout2020.anyhowstep.com/img/card/101.png",
  "The Devil":"https://pumpout2020.anyhowstep.com/img/card/102.png",
  "Native":"https://pumpout2020.anyhowstep.com/img/card/104.png",
  "Vacuum Cleaner":"https://pumpout2020.anyhowstep.com/img/card/107.png",
  "Everybody Got 2 Know":"https://pumpout2020.anyhowstep.com/img/card/108.png",
  "Interference - FULL SONG -":"https://pumpout2020.anyhowstep.com/img/card/109.png",
  "Trotpris":"https://pumpout2020.anyhowstep.com/img/card/113.png",
  "Cleaner":"https://pumpout2020.anyhowstep.com/img/card/114.png",
  "Take Out":"https://pumpout2020.anyhowstep.com/img/card/115.png",
  "Overblow":"https://pumpout2020.anyhowstep.com/img/card/116.png",
  "Pavane":"https://pumpout2020.anyhowstep.com/img/card/118.png",
  "Pine Nut":"https://pumpout2020.anyhowstep.com/img/card/119.png",
  "ASDF":"https://pumpout2020.anyhowstep.com/img/card/120.png",
  "Jonathan's Dream":"https://pumpout2020.anyhowstep.com/img/card/122.png",
  "Superman":"https://pumpout2020.anyhowstep.com/img/card/94.png",
  "No.3":"https://pumpout2020.anyhowstep.com/img/card/95.png",
  "Like A Man":"https://pumpout2020.anyhowstep.com/img/card/96.png",
  "Crashday":"https://pumpout2020.anyhowstep.com/img/card/97.png",
  "Like A Man":"https://pumpout2020.anyhowstep.com/img/card/110.png",
  "No.3":"https://pumpout2020.anyhowstep.com/img/card/1141.png",
  "Crashday":"https://pumpout2020.anyhowstep.com/img/card/112.png",
  "What Happened":"https://pumpout2020.anyhowstep.com/img/card/98.png",
  "Gargoyle":"https://pumpout2020.anyhowstep.com/img/card/99.png",
  "Allegro Con Fuoco":"https://pumpout2020.anyhowstep.com/img/card/100.png",
  "X-Rave":"https://pumpout2020.anyhowstep.com/img/card/103.png",
  "Smells Like A Chocolate":"https://pumpout2020.anyhowstep.com/img/card/105.png",
  "Necromancy":"https://pumpout2020.anyhowstep.com/img/card/106.png",
  "X-Rave":"https://pumpout2020.anyhowstep.com/img/card/117.png",
  "Rave Until The Night Is Over":"https://pumpout2020.anyhowstep.com/img/card/121.png",
  "Dream To Nightmare":"https://pumpout2020.anyhowstep.com/img/card/135.png",
  "VVV":"https://pumpout2020.anyhowstep.com/img/card/140.png",
  "Pop The Track":"https://pumpout2020.anyhowstep.com/img/card/142.png",
  "Electric":"https://pumpout2020.anyhowstep.com/img/card/143.png",
  "Passacaglia":"https://pumpout2020.anyhowstep.com/img/card/144.png",
  "Baroque Virus":"https://pumpout2020.anyhowstep.com/img/card/145.png",
  "Elise":"https://pumpout2020.anyhowstep.com/img/card/146.png",
  "Ignis Fatuus(DM Ashura Mix)":"https://pumpout2020.anyhowstep.com/img/card/147.png",
  "Love Is A Danger Zone(Cranky Mix)":"https://pumpout2020.anyhowstep.com/img/card/148.png",
  "Hypnosis(SynthWulf Mix)":"https://pumpout2020.anyhowstep.com/img/card/149.png",
  "FFF":"https://pumpout2020.anyhowstep.com/img/card/150.png",
  "Unique":"https://pumpout2020.anyhowstep.com/img/card/151.png",
  "Accident":"https://pumpout2020.anyhowstep.com/img/card/152.png",
  "D":"https://pumpout2020.anyhowstep.com/img/card/153.png",
  "U Got Me Rocking":"https://pumpout2020.anyhowstep.com/img/card/154.png",
  "Lucid(PIU Edit)":"https://pumpout2020.anyhowstep.com/img/card/155.png",
  "Nobody":"https://pumpout2020.anyhowstep.com/img/card/156.png",
  "Bad Girl Good Girl":"https://pumpout2020.anyhowstep.com/img/card/157.png",
  "Step":"https://pumpout2020.anyhowstep.com/img/card/158.png",
  "I'm The Best":"https://pumpout2020.anyhowstep.com/img/card/159.png",
  "Can't Nobody":"https://pumpout2020.anyhowstep.com/img/card/160.png",
  "Shanghai Romance":"https://pumpout2020.anyhowstep.com/img/card/161.png",
  "Fantastic Baby":"https://pumpout2020.anyhowstep.com/img/card/162.png",
  "Lie":"https://pumpout2020.anyhowstep.com/img/card/163.png",
  "Heart Breaker":"https://pumpout2020.anyhowstep.com/img/card/164.png",
  "Be Mine":"https://pumpout2020.anyhowstep.com/img/card/165.png",
  "Crayon":"https://pumpout2020.anyhowstep.com/img/card/166.png",
  "Mackerel":"https://pumpout2020.anyhowstep.com/img/card/167.png",
  "Two Guys":"https://pumpout2020.anyhowstep.com/img/card/168.png",
  "One Two Three Go!":"https://pumpout2020.anyhowstep.com/img/card/172.png",
  "Los Malaventurados No Lloran":"https://pumpout2020.anyhowstep.com/img/card/173.png",
  "Sik Asik":"https://pumpout2020.anyhowstep.com/img/card/174.png",
  "Online":"https://pumpout2020.anyhowstep.com/img/card/175.png",
  "Dam":"https://pumpout2020.anyhowstep.com/img/card/176.png",
  "Sugar Eyes":"https://pumpout2020.anyhowstep.com/img/card/177.png",
  "Log In":"https://pumpout2020.anyhowstep.com/img/card/178.png",
  "Windmill":"https://pumpout2020.anyhowstep.com/img/card/179.png",
  "Follow Me":"https://pumpout2020.anyhowstep.com/img/card/180.png",
  "Yeo rae a":"https://pumpout2020.anyhowstep.com/img/card/181.png",
  "Mental Rider":"https://pumpout2020.anyhowstep.com/img/card/182.png",
  "BIG to the BANG":"https://pumpout2020.anyhowstep.com/img/card/214.png",
  "Super Mackerel":"https://pumpout2020.anyhowstep.com/img/card/215.png",
  "Infinity RMX":"https://pumpout2020.anyhowstep.com/img/card/216.png",
  "What Are You Doin?":"https://pumpout2020.anyhowstep.com/img/card/217.png",
  "STEP":"https://pumpout2020.anyhowstep.com/img/card/218.png",
  "I'm The Best":"https://pumpout2020.anyhowstep.com/img/card/219.png",
  "Shanghai Romance":"https://pumpout2020.anyhowstep.com/img/card/220.png",
  "Fantastic Baby":"https://pumpout2020.anyhowstep.com/img/card/221.png",
  "Can't Nobody":"https://pumpout2020.anyhowstep.com/img/card/222.png",
  "Heart Breaker":"https://pumpout2020.anyhowstep.com/img/card/223.png",
  "Pop The Track - SHORT CUT -":"https://pumpout2020.anyhowstep.com/img/card/224.png",
  "Passacaglia - SHORT CUT -":"https://pumpout2020.anyhowstep.com/img/card/225.png",
  "Ignis Fatuus(DM Ashura Mix) - SHORT CUT -":"https://pumpout2020.anyhowstep.com/img/card/226.png",
  "FFF - SHORT CUT -":"https://pumpout2020.anyhowstep.com/img/card/227.png",
  "Unique - SHORT CUT -":"https://pumpout2020.anyhowstep.com/img/card/228.png",
  "U Got Me Rocking - SHORT CUT -":"https://pumpout2020.anyhowstep.com/img/card/229.png",
  "Monolith":"https://pumpout2020.anyhowstep.com/img/card/123.png",
  "Y2Z":"https://pumpout2020.anyhowstep.com/img/card/124.png",
  "Rockhill":"https://pumpout2020.anyhowstep.com/img/card/125.png",
  "Switchback":"https://pumpout2020.anyhowstep.com/img/card/126.png",
  "Ladybug":"https://pumpout2020.anyhowstep.com/img/card/127.png",
  "Hardkore of the North":"https://pumpout2020.anyhowstep.com/img/card/128.png",
  "Rippin' It Up":"https://pumpout2020.anyhowstep.com/img/card/129.png",
  "Tribe Attacker":"https://pumpout2020.anyhowstep.com/img/card/130.png",
  "Virtual Emotion":"https://pumpout2020.anyhowstep.com/img/card/131.png",
  "Take Me Back":"https://pumpout2020.anyhowstep.com/img/card/132.png",
  "RE-RAVE":"https://pumpout2020.anyhowstep.com/img/card/133.png",
  "Heel and Toe":"https://pumpout2020.anyhowstep.com/img/card/134.png",
  "Rainspark":"https://pumpout2020.anyhowstep.com/img/card/136.png",
  "Utopia":"https://pumpout2020.anyhowstep.com/img/card/137.png",
  "Xuxa":"https://pumpout2020.anyhowstep.com/img/card/138.png",
  "Be Alive (Raaban Inc. Mix)":"https://pumpout2020.anyhowstep.com/img/card/139.png",
  "Star Command":"https://pumpout2020.anyhowstep.com/img/card/141.png",
  "Nemesis":"https://pumpout2020.anyhowstep.com/img/card/183.png",
  "Latino Virus":"https://pumpout2020.anyhowstep.com/img/card/184.png",
  "Yog-Sothoth":"https://pumpout2020.anyhowstep.com/img/card/185.png",
  "Chinese restaurant":"https://pumpout2020.anyhowstep.com/img/card/186.png",
  "Requiem":"https://pumpout2020.anyhowstep.com/img/card/187.png",
  "Meteorize":"https://pumpout2020.anyhowstep.com/img/card/188.png",
  "Leakage Voltage":"https://pumpout2020.anyhowstep.com/img/card/189.png",
  "Super Fantasy":"https://pumpout2020.anyhowstep.com/img/card/190.png",
  "Red Swan":"https://pumpout2020.anyhowstep.com/img/card/191.png",
  "Allegro Piu Mosso":"https://pumpout2020.anyhowstep.com/img/card/192.png",
  "Rock the house":"https://pumpout2020.anyhowstep.com/img/card/193.png",
  "Robot battle":"https://pumpout2020.anyhowstep.com/img/card/194.png",
  "Bar Bar Bar":"https://pumpout2020.anyhowstep.com/img/card/195.png",
  "ELVIS":"https://pumpout2020.anyhowstep.com/img/card/196.png",
  "I'm Sorry":"https://pumpout2020.anyhowstep.com/img/card/197.png",
  "Pandora":"https://pumpout2020.anyhowstep.com/img/card/198.png",
  "Hate, Don't Hate!":"https://pumpout2020.anyhowstep.com/img/card/199.png",
  "Supermagic":"https://pumpout2020.anyhowstep.com/img/card/200.png",
  "Sugar Free":"https://pumpout2020.anyhowstep.com/img/card/201.png",
  "HER":"https://pumpout2020.anyhowstep.com/img/card/202.png",
  "NoNoNo":"https://pumpout2020.anyhowstep.com/img/card/203.png",
  "Loner":"https://pumpout2020.anyhowstep.com/img/card/204.png",
  "Flying duck":"https://pumpout2020.anyhowstep.com/img/card/205.png",
  "Ineffective Boss Without Power":"https://pumpout2020.anyhowstep.com/img/card/365.png",
  "One":"https://pumpout2020.anyhowstep.com/img/card/206.png",
  "Cosmical Rhythm":"https://pumpout2020.anyhowstep.com/img/card/207.png",
  "MATADOR":"https://pumpout2020.anyhowstep.com/img/card/208.png",
  "Ragnarok":"https://pumpout2020.anyhowstep.com/img/card/209.png",
  "Karyawisata":"https://pumpout2020.anyhowstep.com/img/card/210.png",
  "Beethoven Influenza":"https://pumpout2020.anyhowstep.com/img/card/230.png",
  "Bar Bar Bar":"https://pumpout2020.anyhowstep.com/img/card/231.png",
  "Sugar Free":"https://pumpout2020.anyhowstep.com/img/card/232.png",
  "Yog-Sothoth - SHORT CUT -":"https://pumpout2020.anyhowstep.com/img/card/233.png",
  "Rock the house - SHORT CUT -":"https://pumpout2020.anyhowstep.com/img/card/234.png",
  "Rabiosa":"https://pumpout2020.anyhowstep.com/img/card/170.png",
  "Danza Kuduro":"https://pumpout2020.anyhowstep.com/img/card/169.png",
  "Lovumba":"https://pumpout2020.anyhowstep.com/img/card/171.png",
  "Limbo":"https://pumpout2020.anyhowstep.com/img/card/211.png",
  "Melodia":"https://pumpout2020.anyhowstep.com/img/card/212.png",
  "Que Viva La Vida":"https://pumpout2020.anyhowstep.com/img/card/213.png",
  "On and On":"https://pumpout2020.anyhowstep.com/img/card/366.png",
  "Achluoias":"https://pumpout2020.anyhowstep.com/img/card/367.png",
  "PRIME Opening":"https://pumpout2020.anyhowstep.com/img/card/368.png",
  "Milky Way Galaxy":"https://pumpout2020.anyhowstep.com/img/card/371.png",
  "Selfishness":"https://pumpout2020.anyhowstep.com/img/card/379.png",
  "Selfishness":"https://pumpout2020.anyhowstep.com/img/card/381.png",
  "Avalanche":"https://pumpout2020.anyhowstep.com/img/card/374.png",
  "Very good":"https://pumpout2020.anyhowstep.com/img/card/375.png",
  "Avalanquiem":"https://pumpout2020.anyhowstep.com/img/card/376.png",
  "You Got Me Crazy":"https://pumpout2020.anyhowstep.com/img/card/372.png",
  "Venus":"https://pumpout2020.anyhowstep.com/img/card/378.png",
  "Sugar Conspiracy Theory":"https://pumpout2020.anyhowstep.com/img/card/382.png",
  "Move That Body!":"https://pumpout2020.anyhowstep.com/img/card/383.png",
  "Move That Body!":"https://pumpout2020.anyhowstep.com/img/card/385.png",
  "Bad Apple!! feat. Nomico":"https://pumpout2020.anyhowstep.com/img/card/435.png",
  "Smile Diary":"https://pumpout2020.anyhowstep.com/img/card/434.png",
  "Mitotsudaira":"https://pumpout2020.anyhowstep.com/img/card/433.png",
  "Sudden Romance [PIU Edit]":"https://pumpout2020.anyhowstep.com/img/card/432.png",
  "Imprinting":"https://pumpout2020.anyhowstep.com/img/card/430.png",
  "Creed - 1st Desire -":"https://pumpout2020.anyhowstep.com/img/card/448.png",
  "Katkoi":"https://pumpout2020.anyhowstep.com/img/card/388.png",
  "B2":"https://pumpout2020.anyhowstep.com/img/card/1412.png",
  "1950":"https://pumpout2020.anyhowstep.com/img/card/387.png",
  "Dolly Kiss":"https://pumpout2020.anyhowstep.com/img/card/1458.png",
  "Silhouette Effect":"https://pumpout2020.anyhowstep.com/img/card/391.png",
  "Annihilator Method":"https://pumpout2020.anyhowstep.com/img/card/399.png",
  "Silhouette Effect":"https://pumpout2020.anyhowstep.com/img/card/392.png",
  "Sorano Shirabe":"https://pumpout2020.anyhowstep.com/img/card/450.png",
  "Hands Up East4A mix":"https://pumpout2020.anyhowstep.com/img/card/1324.png",
  "Energy":"https://pumpout2020.anyhowstep.com/img/card/1115.png",
  "Hot Issue":"https://pumpout2020.anyhowstep.com/img/card/1109.png",
  "Hot Issue":"https://pumpout2020.anyhowstep.com/img/card/1143.png",
  "K-POP Girl Group RMX":"https://pumpout2020.anyhowstep.com/img/card/1129.png",
  "Last Farewell":"https://pumpout2020.anyhowstep.com/img/card/1113.png",
  "Magic":"https://pumpout2020.anyhowstep.com/img/card/1108.png",
  "Magic Girl":"https://pumpout2020.anyhowstep.com/img/card/1110.png",
  "Magic Girl":"https://pumpout2020.anyhowstep.com/img/card/1136.png",
  "Mother":"https://pumpout2020.anyhowstep.com/img/card/1116.png",
  "Shock":"https://pumpout2020.anyhowstep.com/img/card/1112.png",
  "Shock":"https://pumpout2020.anyhowstep.com/img/card/1138.png",
  "80's Pop":"https://pumpout2020.anyhowstep.com/img/card/1020.png",
  "Betrayer -act.2-":"https://pumpout2020.anyhowstep.com/img/card/1003.png",
  "Big Beat":"https://pumpout2020.anyhowstep.com/img/card/1005.png",
  "By chance":"https://pumpout2020.anyhowstep.com/img/card/1007.png",
  "Do It Reggae Style":"https://pumpout2020.anyhowstep.com/img/card/1021.png",
  "Enjoy! Enjoy!":"https://pumpout2020.anyhowstep.com/img/card/1012.png",
  "Exciting":"https://pumpout2020.anyhowstep.com/img/card/1006.png",
  "Fire":"https://pumpout2020.anyhowstep.com/img/card/1015.png",
  "Fire":"https://pumpout2020.anyhowstep.com/img/card/1045.png",
  "Good Life":"https://pumpout2020.anyhowstep.com/img/card/1004.png",
  "History: We Are The ZEST":"https://pumpout2020.anyhowstep.com/img/card/1041.png",
  "Innocent":"https://pumpout2020.anyhowstep.com/img/card/1011.png",
  "K-POP Mix (Old & New)":"https://pumpout2020.anyhowstep.com/img/card/1032.png",
  "Mission Possible -Blow Back-":"https://pumpout2020.anyhowstep.com/img/card/1029.png",
  "msgoon RMX pt.5":"https://pumpout2020.anyhowstep.com/img/card/1038.png",
  "msgoon RMX pt.7":"https://pumpout2020.anyhowstep.com/img/card/1040.png",
  "No Rhyme No Reason":"https://pumpout2020.anyhowstep.com/img/card/1019.png",
  "Pro POP Mix":"https://pumpout2020.anyhowstep.com/img/card/1036.png",
  "PUMP IT UP with YOU":"https://pumpout2020.anyhowstep.com/img/card/1047.png",
  "Pumping Jumping":"https://pumpout2020.anyhowstep.com/img/card/1030.png",
  "The angel who lost wings":"https://pumpout2020.anyhowstep.com/img/card/1010.png",
  "To the sky":"https://pumpout2020.anyhowstep.com/img/card/1009.png",
  "Wanna":"https://pumpout2020.anyhowstep.com/img/card/1016.png",
  "Wanna":"https://pumpout2020.anyhowstep.com/img/card/1046.png",
  "2006. LOVE SONG":"https://pumpout2020.anyhowstep.com/img/card/D14.png",
  "45RPM & Eun Ji Won Mix":"https://pumpout2020.anyhowstep.com/img/card/F30.png",
  "Adios":"https://pumpout2020.anyhowstep.com/img/card/F05.png",
  "Change Myself":"https://pumpout2020.anyhowstep.com/img/card/F17.png",
  "Chopstix":"https://pumpout2020.anyhowstep.com/img/card/E26.png",
  "Crazy":"https://pumpout2020.anyhowstep.com/img/card/F12.png",
  "Do It!":"https://pumpout2020.anyhowstep.com/img/card/F27.png",
  "Enter the Dragon":"https://pumpout2020.anyhowstep.com/img/card/F64.png",
  "Fly":"https://pumpout2020.anyhowstep.com/img/card/D05.png",
  "FLY":"https://pumpout2020.anyhowstep.com/img/card/E76.png",
  "Forward":"https://pumpout2020.anyhowstep.com/img/card/F10.png",
  "Forward":"https://pumpout2020.anyhowstep.com/img/card/F55.png",
  "Groovin' Motion":"https://pumpout2020.anyhowstep.com/img/card/E30.png",
  "Guitar Man":"https://pumpout2020.anyhowstep.com/img/card/E23.png",
  "Haley":"https://pumpout2020.anyhowstep.com/img/card/D26.png",
  "Hybs":"https://pumpout2020.anyhowstep.com/img/card/D23.png",
  "Jam O Beat":"https://pumpout2020.anyhowstep.com/img/card/E25.png",
  "La La La":"https://pumpout2020.anyhowstep.com/img/card/F04.png",
  "La La La":"https://pumpout2020.anyhowstep.com/img/card/F51.png",
  "Money":"https://pumpout2020.anyhowstep.com/img/card/E04.png",
  "Money Fingers":"https://pumpout2020.anyhowstep.com/img/card/E52.png",
  "msgoon RMX pt.3":"https://pumpout2020.anyhowstep.com/img/card/F46.png",
  "msgoon RMX pt.1":"https://pumpout2020.anyhowstep.com/img/card/F44.png",
  "Novasonic Mix ver.3":"https://pumpout2020.anyhowstep.com/img/card/F40.png",
  "NX K-POP Dance":"https://pumpout2020.anyhowstep.com/img/card/D31.png",
  "One Night":"https://pumpout2020.anyhowstep.com/img/card/D06.png",
  "Pump Breakers":"https://pumpout2020.anyhowstep.com/img/card/F16.png",
  "Slightly":"https://pumpout2020.anyhowstep.com/img/card/F06.png",
  "Slightly":"https://pumpout2020.anyhowstep.com/img/card/F56.png",
  "Turkey Virus":"https://pumpout2020.anyhowstep.com/img/card/F43.png",
  "Uprock":"https://pumpout2020.anyhowstep.com/img/card/F11.png",
  "Very Old Couples":"https://pumpout2020.anyhowstep.com/img/card/E07.png",
  "We Goin' Fly Remix":"https://pumpout2020.anyhowstep.com/img/card/D27.png",
  "Enter the Dragon":"https://pumpout2020.anyhowstep.com/img/card/C18.png",
  "Go":"https://pumpout2020.anyhowstep.com/img/card/A12.png",
  "Mr. Fire Fighter":"https://pumpout2020.anyhowstep.com/img/card/C15.png",
  "My Friend":"https://pumpout2020.anyhowstep.com/img/card/C09.png",
  "NOVARASH REMIX":"https://pumpout2020.anyhowstep.com/img/card/B26.png",
  "Storm":"https://pumpout2020.anyhowstep.com/img/card/C19.png",
  "D Gang":"https://pumpout2020.anyhowstep.com/img/card/807.png",
  "Empire of the Sun":"https://pumpout2020.anyhowstep.com/img/card/821.png",
  "Get Your Groove On":"https://pumpout2020.anyhowstep.com/img/card/703.png",
  "Hello":"https://pumpout2020.anyhowstep.com/img/card/811.png",
  "Miss S' story":"https://pumpout2020.anyhowstep.com/img/card/716.png",
  "Mission Possible":"https://pumpout2020.anyhowstep.com/img/card/706.png",
  "Street show down":"https://pumpout2020.anyhowstep.com/img/card/709.png",
  "Top City":"https://pumpout2020.anyhowstep.com/img/card/710.png",
  "We will meet again":"https://pumpout2020.anyhowstep.com/img/card/715.png",
  "A nightmare":"https://pumpout2020.anyhowstep.com/img/card/306.png",
  "Betrayer":"https://pumpout2020.anyhowstep.com/img/card/472.png",
  "Close Your Eye":"https://pumpout2020.anyhowstep.com/img/card/307.png",
  "First Love":"https://pumpout2020.anyhowstep.com/img/card/402.png",
  "Free Style":"https://pumpout2020.anyhowstep.com/img/card/308.png",
  "Hatred":"https://pumpout2020.anyhowstep.com/img/card/111.png",
  "N":"https://pumpout2020.anyhowstep.com/img/card/502.png",
  "RUN!":"https://pumpout2020.anyhowstep.com/img/card/413.png",
  "She Likes Pizza":"https://pumpout2020.anyhowstep.com/img/card/310.png",
  "Setsuna Trip":"https://pumpout2020.anyhowstep.com/img/card/456.png",
  "Trashy Innocence":"https://pumpout2020.anyhowstep.com/img/card/458.png",
  "FOUR SEASONS OF LONELINESS verβ feat. sariyajin":"https://pumpout2020.anyhowstep.com/img/card/452.png",
  "THE REVOLUTION":"https://pumpout2020.anyhowstep.com/img/card/403.png",
  "Stardust Overdrive":"https://pumpout2020.anyhowstep.com/img/card/393.png",
  "FOUR SEASONS OF LONELINESS verβ feat. sariyajin":"https://pumpout2020.anyhowstep.com/img/card/460.png",
  "Bad Apple!! feat. Nomico - FULL SONG -":"https://pumpout2020.anyhowstep.com/img/card/461.png",
  "Stardust Overdrive - SHORT CUT -":"https://pumpout2020.anyhowstep.com/img/card/395.png",
  "PRIME":"https://pumpout2020.anyhowstep.com/img/card/465.png",
  "Renai Yuusha":"https://pumpout2020.anyhowstep.com/img/card/463.png",
  "Houkago Stride":"https://pumpout2020.anyhowstep.com/img/card/464.png",
  "Amai Yuuwaku Dangerous":"https://pumpout2020.anyhowstep.com/img/card/373.png",
  "Hyacinth":"https://pumpout2020.anyhowstep.com/img/card/386.png",
  "Reminiscence":"https://pumpout2020.anyhowstep.com/img/card/377.png",
  "Super Fantasy":"https://pumpout2020.anyhowstep.com/img/card/397.png",
  "Yoropiku Pikuyoro!":"https://pumpout2020.anyhowstep.com/img/card/384.png",
  "Bad ∞ End ∞ Night":"https://pumpout2020.anyhowstep.com/img/card/473.png",
  "video out c":"https://pumpout2020.anyhowstep.com/img/card/396.png",
  "Move That Body!":"https://pumpout2020.anyhowstep.com/img/card/471.png",
  "Violet Perfume":"https://pumpout2020.anyhowstep.com/img/card/398.png",
  "Hypercube":"https://pumpout2020.anyhowstep.com/img/card/478.png",
  "Queen of the Red":"https://pumpout2020.anyhowstep.com/img/card/477.png",
  "Scorpion King":"https://pumpout2020.anyhowstep.com/img/card/479.png",
  "NoNoNo":"https://pumpout2020.anyhowstep.com/img/card/476.png",
  "Idealized Romance":"https://pumpout2020.anyhowstep.com/img/card/481.png",
  "Point Zero One":"https://pumpout2020.anyhowstep.com/img/card/400.png",
  "Elysium":"https://pumpout2020.anyhowstep.com/img/card/394.png",
  "Creed - 1st Desire -":"https://pumpout2020.anyhowstep.com/img/card/462.png",
  "Just Hold On (To All Fighters)":"https://pumpout2020.anyhowstep.com/img/card/484.png",
  "Enhance Reality":"https://pumpout2020.anyhowstep.com/img/card/416.png",
  "Pandora":"https://pumpout2020.anyhowstep.com/img/card/483.png",
  "Mad5cience":"https://pumpout2020.anyhowstep.com/img/card/390.png",
  "Red Snow":"https://pumpout2020.anyhowstep.com/img/card/404.png",
  "Break it Down":"https://pumpout2020.anyhowstep.com/img/card/485.png",
  "Devil's Spirit":"https://pumpout2020.anyhowstep.com/img/card/IN11.png",
  "Blow":"https://pumpout2020.anyhowstep.com/img/card/IN03.png",
  "Bubblegum Dancer (J-Mi & Midi-D Remix)":"https://pumpout2020.anyhowstep.com/img/card/IN04.png",
  "Creatures ov Deception":"https://pumpout2020.anyhowstep.com/img/card/IN05.png",
  "Dance (The Way It Moves)":"https://pumpout2020.anyhowstep.com/img/card/IN06.png",
  "Euphorium":"https://pumpout2020.anyhowstep.com/img/card/IN17.png",
  "Extravaganza Reborn":"https://pumpout2020.anyhowstep.com/img/card/IN18.png",
  "Fallen Angel":"https://pumpout2020.anyhowstep.com/img/card/15C5.png",
  "Fresh":"https://pumpout2020.anyhowstep.com/img/card/IN21.png",
  "Invincible":"https://pumpout2020.anyhowstep.com/img/card/IN28.png",
  "Last Day Alive":"https://pumpout2020.anyhowstep.com/img/card/IN30.png",
  "Oh! Rosa!":"https://pumpout2020.anyhowstep.com/img/card/401.png",
  "Pump Jump":"https://pumpout2020.anyhowstep.com/img/card/501.png",
  "Pumping Up":"https://pumpout2020.anyhowstep.com/img/card/311.png",
  "Moment Day":"https://pumpout2020.anyhowstep.com/img/card/380.png",
  "Force of Ra":"https://pumpout2020.anyhowstep.com/img/card/1409.png",
  "Amphitryon":"https://pumpout2020.anyhowstep.com/img/card/406.png",
  "Blaze emotion (Band version)":"https://pumpout2020.anyhowstep.com/img/card/407.png",
  "PARADOXX":"https://pumpout2020.anyhowstep.com/img/card/389.png",
  "Removable Disk0":"https://pumpout2020.anyhowstep.com/img/card/410.png",
  "Feel My Happiness":"https://pumpout2020.anyhowstep.com/img/card/405.png",
  "Campanella":"https://pumpout2020.anyhowstep.com/img/card/414.png",
  "Across the Ocean":"https://pumpout2020.anyhowstep.com/img/card/412.png",
  "Like Me":"https://pumpout2020.anyhowstep.com/img/card/493.png",
  "You again my love":"https://pumpout2020.anyhowstep.com/img/card/417.png",
  "Acquaintance":"https://pumpout2020.anyhowstep.com/img/card/1557.png",
  "Arcana Force":"https://pumpout2020.anyhowstep.com/img/card/1525.png",
  "Asterios -ReEntry-":"https://pumpout2020.anyhowstep.com/img/card/15B0.png",
  "Last Rebirth":"https://pumpout2020.anyhowstep.com/img/card/1501.png",
  "Hellfire":"https://pumpout2020.anyhowstep.com/img/card/1503.png",
  "God Mode feat. skizzo":"https://pumpout2020.anyhowstep.com/img/card/1507.png",
  "Further":"https://pumpout2020.anyhowstep.com/img/card/1509.png",
  "Bring Back The Beat":"https://pumpout2020.anyhowstep.com/img/card/1512.png",
  "Sarabande":"https://pumpout2020.anyhowstep.com/img/card/1516.png",
  "BANG BANG BANG":"https://pumpout2020.anyhowstep.com/img/card/1544.png",
  "Me Gustas Tu":"https://pumpout2020.anyhowstep.com/img/card/1545.png",
  "RHYTHM TA":"https://pumpout2020.anyhowstep.com/img/card/1546.png",
  "PICK ME":"https://pumpout2020.anyhowstep.com/img/card/1548.png",
  "Jackpot":"https://pumpout2020.anyhowstep.com/img/card/1549.png",
  "BOOMBAYAH":"https://pumpout2020.anyhowstep.com/img/card/1551.png",
  "Up & Down":"https://pumpout2020.anyhowstep.com/img/card/1553.png",
  "You're the best":"https://pumpout2020.anyhowstep.com/img/card/1555.png",
  "NUMBER NINE":"https://pumpout2020.anyhowstep.com/img/card/1556.png",
  "Moon Light Dance":"https://pumpout2020.anyhowstep.com/img/card/1564.png",
  "Death Moon":"https://pumpout2020.anyhowstep.com/img/card/15A6.png",
  "Christmas Memories":"https://pumpout2020.anyhowstep.com/img/card/15A8.png",
  "Le Grand Bleu":"https://pumpout2020.anyhowstep.com/img/card/15B1.png",
  "Vulcan":"https://pumpout2020.anyhowstep.com/img/card/15D0.png",
  "BANG BANG BANG":"https://pumpout2020.anyhowstep.com/img/card/15E1.png",
  "Sarabande":"https://pumpout2020.anyhowstep.com/img/card/15F0.png",
  "Death Moon":"https://pumpout2020.anyhowstep.com/img/card/15F1.png",
  "Kitty Cat":"https://pumpout2020.anyhowstep.com/img/card/PE55.png",
  "Moonshard":"https://pumpout2020.anyhowstep.com/img/card/IN32.png",
  "Nervous":"https://pumpout2020.anyhowstep.com/img/card/IN33.png",
  "Party 4U (Holy Nite Mix)":"https://pumpout2020.anyhowstep.com/img/card/IN35.png",
  "Shadows":"https://pumpout2020.anyhowstep.com/img/card/IN40.png",
  "Solitary (Sanxion7 Mix)":"https://pumpout2020.anyhowstep.com/img/card/IN41.png",
  "The Ark Sailing Over Truth":"https://pumpout2020.anyhowstep.com/img/card/IN42.png",
  "The Best It's Gonna' Get":"https://pumpout2020.anyhowstep.com/img/card/IN43.png",
  "The Fool":"https://pumpout2020.anyhowstep.com/img/card/IN44.png",
  "The Trident Ov Power":"https://pumpout2020.anyhowstep.com/img/card/IN46.png",
  "True":"https://pumpout2020.anyhowstep.com/img/card/IN47.png",
  "Venetian Staccato":"https://pumpout2020.anyhowstep.com/img/card/IN48.png",
  "Baroque Virus - FULL SONG -":"https://pumpout2020.anyhowstep.com/img/card/INC01.png",
  "Blow":"https://pumpout2020.anyhowstep.com/img/card/INC03.png",
  "Crazy":"https://pumpout2020.anyhowstep.com/img/card/F61.png",
  "Don't Bother Me":"https://pumpout2020.anyhowstep.com/img/card/INC06.png",
  "Electric":"https://pumpout2020.anyhowstep.com/img/card/INC07.png",
  "Funky Tonight":"https://pumpout2020.anyhowstep.com/img/card/INC08.png",
  "Gargoyle - FULL SONG -":"https://pumpout2020.anyhowstep.com/img/card/15E5.png",
  "Guitar Man":"https://pumpout2020.anyhowstep.com/img/card/E51.png",
  "Monkey Fingers":"https://pumpout2020.anyhowstep.com/img/card/E53.png",
  "Nervous":"https://pumpout2020.anyhowstep.com/img/card/INC11.png",
  "Pop The Track":"https://pumpout2020.anyhowstep.com/img/card/INC12.png",
  "The Ark Sailing Over Truth":"https://pumpout2020.anyhowstep.com/img/card/INC15_B.png",
  "We Are":"https://pumpout2020.anyhowstep.com/img/card/INC17.png",
  "Armakitten 2-X":"https://pumpout2020.anyhowstep.com/img/card/INA01.png",
  "Blowin It Up":"https://pumpout2020.anyhowstep.com/img/card/INA02.png",
  "Jam O Beat # No 4":"https://pumpout2020.anyhowstep.com/img/card/F35.png",  
  "Clue":"https://pumpout2020.anyhowstep.com/img/card/15B7.png",
  "Just Kiddin":"https://pumpout2020.anyhowstep.com/img/card/1576.png",
  "Me Gustas Tu":"https://pumpout2020.anyhowstep.com/img/card/15E0.png",
  "Chase Me":"https://pumpout2020.anyhowstep.com/img/card/1547.png",
  "Kasou Shinja":"https://pumpout2020.anyhowstep.com/img/card/469.png",
  "STEP":"https://pumpout2020.anyhowstep.com/img/card/1575.png",
  "BOOMBAYAH":"https://pumpout2020.anyhowstep.com/img/card/15E2.png",
  "HELIX":"https://pumpout2020.anyhowstep.com/img/card/1597.png",
  "Hyperion":"https://pumpout2020.anyhowstep.com/img/card/1598.png",
  "HUSH":"https://pumpout2020.anyhowstep.com/img/card/1584.png",
  "HUSH - FULL SONG -":"https://pumpout2020.anyhowstep.com/img/card/15E6.png",
  "GOOD NIGHT":"https://pumpout2020.anyhowstep.com/img/card/1554.png",
  "Allegro Furioso":"https://pumpout2020.anyhowstep.com/img/card/1526.png",
  "Super Stylin'":"https://pumpout2020.anyhowstep.com/img/card/15A7.png",
  "Redline":"https://pumpout2020.anyhowstep.com/img/card/15B8.png",
  "PRIME2 Opening":"https://pumpout2020.anyhowstep.com/img/card/15F3.png",
  "Utsushiyo No Kaze feat. Kana":"https://pumpout2020.anyhowstep.com/img/card/1530.png",
  "Start On Red":"https://pumpout2020.anyhowstep.com/img/card/15A2.png",
  "Seize My Day":"https://pumpout2020.anyhowstep.com/img/card/15C4.png",
  "Up & Down":"https://pumpout2020.anyhowstep.com/img/card/15E3.png",
  "SOBER":"https://pumpout2020.anyhowstep.com/img/card/1552.png",
  "Shub Niggurath":"https://pumpout2020.anyhowstep.com/img/card/1508.png",
  "Magical Vacation":"https://pumpout2020.anyhowstep.com/img/card/15A4.png",
  "Acquaintance":"https://pumpout2020.anyhowstep.com/img/card/15E4.png",
  "Overblow2":"https://pumpout2020.anyhowstep.com/img/card/1518.png",
  "Hey U":"https://pumpout2020.anyhowstep.com/img/card/1533.png",
  "BEDLAM":"https://pumpout2020.anyhowstep.com/img/card/15B5.png",
  "Leather":"https://pumpout2020.anyhowstep.com/img/card/15D3.png",
  "Gotta Be You":"https://pumpout2020.anyhowstep.com/img/card/1550.png",
  "Shub Niggurath":"https://pumpout2020.anyhowstep.com/img/card/15F4.png",
  "Time Attack <Blue>":"https://pumpout2020.anyhowstep.com/img/card/15A3.png",
  "Kill Them!":"https://pumpout2020.anyhowstep.com/img/card/15B9.png",
  "Chase Me - FULL SONG -":"https://pumpout2020.anyhowstep.com/img/card/15E7.png",
  "Heart Attack":"https://pumpout2020.anyhowstep.com/img/card/1578.png",
  "Nakakapagpabagabag":"https://pumpout2020.anyhowstep.com/img/card/1577.png",
  "Cross Time":"https://pumpout2020.anyhowstep.com/img/card/1594.png",
  "Keep On!":"https://pumpout2020.anyhowstep.com/img/card/15A9.png",
  "Super Capriccio":"https://pumpout2020.anyhowstep.com/img/card/1502.png",
  "Anguished Unmaking":"https://pumpout2020.anyhowstep.com/img/card/1529.png",
  "Twist of Fate (feat. Ruriling)":"https://pumpout2020.anyhowstep.com/img/card/1536.png",
  "HTTP":"https://pumpout2020.anyhowstep.com/img/card/1537.png",
  "Energetic":"https://pumpout2020.anyhowstep.com/img/card/1559.png",
  "Beautiful":"https://pumpout2020.anyhowstep.com/img/card/1560.png",
  "REALLY REALLY":"https://pumpout2020.anyhowstep.com/img/card/1562.png",
  "V3":"https://pumpout2020.anyhowstep.com/img/card/1593.png",
  "INFINITY":"https://pumpout2020.anyhowstep.com/img/card/15B2.png",
  "Hyperion":"https://pumpout2020.anyhowstep.com/img/card/15F5.png",
  "Kasou Shinja - SHORT CUT -":"https://pumpout2020.anyhowstep.com/img/card/15F6.png",
  "PICK ME":"https://pumpout2020.anyhowstep.com/img/card/1561.png",
  "Rave 'til the Earth's End":"https://pumpout2020.anyhowstep.com/img/card/1540.png",
  "The Festival of Ghost 2 (Sneak)":"https://pumpout2020.anyhowstep.com/img/card/1595.png",
  "Donatello":"https://pumpout2020.anyhowstep.com/img/card/15C0.png",
  "Up & Up (Produced by AWAL)":"https://pumpout2020.anyhowstep.com/img/card/1538.png",
  "Travel to future":"https://pumpout2020.anyhowstep.com/img/card/1539.png",
  "Tritium":"https://pumpout2020.anyhowstep.com/img/card/1504.png",
  "Silver Beat feat. ChisaUezono":"https://pumpout2020.anyhowstep.com/img/card/1511.png",
  "Gothique Resonance":"https://pumpout2020.anyhowstep.com/img/card/15B3.png",
  "Awakening":"https://pumpout2020.anyhowstep.com/img/card/1541.png",
  "Passing Rider":"https://pumpout2020.anyhowstep.com/img/card/1524.png",
  "Cross Over feat. LyuU":"https://pumpout2020.anyhowstep.com/img/card/1505.png",
  "Waltz of Doge":"https://pumpout2020.anyhowstep.com/img/card/1543.png",
  "Black Dragon":"https://pumpout2020.anyhowstep.com/img/card/15A0.png",
  "A Site De La Rue":"https://pumpout2020.anyhowstep.com/img/card/15B6.png",
  "Break Out":"https://pumpout2020.anyhowstep.com/img/card/1513.png",
  "The Quick Brown Fox Jumps Over The Lazy Dog":"https://pumpout2020.anyhowstep.com/img/card/1510.png",
  "Visual Dream II (In Fiction)":"https://pumpout2020.anyhowstep.com/img/card/15A5.png",
  "BSPower Explosion":"https://pumpout2020.anyhowstep.com/img/card/15A1.png",
  "ESCAPE":"https://pumpout2020.anyhowstep.com/img/card/1542.png",
  "Shub Sothoth":"https://pumpout2020.anyhowstep.com/img/card/15D2.png",
  "got STOLEN?":"https://pumpout2020.anyhowstep.com/img/card/misc/got-stolen.png",
  "Slam (FULL SONG)":"https://pumpout2020.anyhowstep.com/img/card/misc/slam-full-song.png",
  "Disco Dancer":"https://pumpout2020.anyhowstep.com/img/card/misc/disco-dancer.png",
  "Destroy":"https://pumpout2020.anyhowstep.com/img/card/misc/destroy.png",
  "π·ρ·maniac (Full Song)":"https://pumpout2020.anyhowstep.com/img/card/misc/pi-rho-maniac-full-song.png",
  "Night Duty":"https://pumpout2020.anyhowstep.com/img/card/1151A.png",
  "Black Maria":"https://pumpout2020.anyhowstep.com/img/card/misc/black-maria.png",
  "Further":"https://pumpout2020.anyhowstep.com/img/card/misc/further.png",
  "Oh My":"https://pumpout2020.anyhowstep.com/img/card/misc/oh-my.png",
  "Butterfly (Full Song)":"https://pumpout2020.anyhowstep.com/img/card/misc/butterfly-full-song.png",
  "Destroy Them":"https://pumpout2020.anyhowstep.com/img/card/misc/destroy-them.png",
  "Dawgs in Da Revolution":"https://pumpout2020.anyhowstep.com/img/card/misc/dawgs-in-da-revolution.png",
  "The Trident ov Power (Full Song)":"https://pumpout2020.anyhowstep.com/img/card/misc/the-trident-ov-power-full-song.png",
  "Jonathan’s Dream (Full Song)":"https://pumpout2020.anyhowstep.com/img/card/misc/jonathans-dream-full-song.png",
  "VV":"https://pumpout2020.anyhowstep.com/img/card/misc/vv.png",
  "Girlz Buttz":"https://pumpout2020.anyhowstep.com/img/card/misc/girlz-buttz.png",
  "Ethereality":"https://pumpout2020.anyhowstep.com/img/card/misc/ethereality.png",
  "Z - The New Legend":"https://pumpout2020.anyhowstep.com/img/card/PE392.png",
  "Finite":"https://pumpout2020.anyhowstep.com/img/card/misc/finite.png",
  "Dragonfly":"https://pumpout2020.anyhowstep.com/img/card/misc/dragonfly.png",
  "Final Audition Infinity":"https://pumpout2020.anyhowstep.com/img/card/misc/final-audition-infinity.png",
  "DIMM_ (Sleep Deprivation Short Mix)":"https://pumpout2020.anyhowstep.com/img/card/misc/dimm.png",
  "Napad":"https://pumpout2020.anyhowstep.com/img/card/misc/napad.png",
  "Incubator":"https://pumpout2020.anyhowstep.com/img/card/misc/incubator.png",
  "π·ρ·maniac":"https://pumpout2020.anyhowstep.com/img/card/misc/pi-rho-maniac.png",
  "Dance on Fire: Retribution":"https://pumpout2020.anyhowstep.com/img/card/misc/dance-on-fire-retribution.png",
  "Party All Night":"https://pumpout2020.anyhowstep.com/img/card/misc/party-all-night.png",
  "Black Maria":"https://pumpout2020.anyhowstep.com/img/card/misc/black-maria-full-song.png",
  "Baroque Virus (original ver.)":"https://pumpout2020.anyhowstep.com/img/card/misc/baroque-virus-original-ver.png",
  "Wi-Ex-Doc-Vacuum":"https://pumpout2020.anyhowstep.com/img/card/misc/wi-ex-doc-vacuum.png",
  "Napalmancy":"https://pumpout2020.anyhowstep.com/img/card/misc/napalmancy.png",
  "Infinitude":"https://pumpout2020.anyhowstep.com/img/card/misc/infinitude.png",
  "MAWARU INFINITY":"https://pumpout2020.anyhowstep.com/img/card/misc/mawaru-infinity.png",
  "Cannon X.1 Original Version":"https://pumpout2020.anyhowstep.com/img/card/misc/cannon-x-1-original-ver.png",
  "Fly high":"https://pumpout2020.anyhowstep.com/img/card/xx-fly-high.png",
  "HANN (Alone)":"https://pumpout2020.anyhowstep.com/img/card/xx-hann.png",
  "NEKKOYA (PICK ME)":"https://pumpout2020.anyhowstep.com/img/card/xx-nekkoya.png",
  "Wedding Crashers":"https://pumpout2020.anyhowstep.com/img/card/xx-wedding-crashers.png",
  "Obliteration":"https://pumpout2020.anyhowstep.com/img/card/xx-obliteration.png",
  "I Want U":"https://pumpout2020.anyhowstep.com/img/card/xx-i-want-u.png",
  "Nyarlathotep":"https://pumpout2020.anyhowstep.com/img/card/xx-nyarlathotep.png",
  "Skeptic":"https://pumpout2020.anyhowstep.com/img/card/xx-skeptic.png",
  "%X (Percent X)":"https://pumpout2020.anyhowstep.com/img/card/xx-percent-x.png",
  "Le Grand Rouge":"https://pumpout2020.anyhowstep.com/img/card/xx-le-grand-rouge.png",
  "Macaron Day":"https://pumpout2020.anyhowstep.com/img/card/xx-macaron-day.png",
  "Poseidon":"https://pumpout2020.anyhowstep.com/img/card/xx-poseidon.png",
  "VANISH":"https://pumpout2020.anyhowstep.com/img/card/xx-vanish.png",
  "Kimchi Fingers":"https://pumpout2020.anyhowstep.com/img/card/xx-kimchi-fingers.png",
  "Desaparecer":"https://pumpout2020.anyhowstep.com/img/card/xx-desaparecer.png",
  "Nyarlathotep":"https://pumpout2020.anyhowstep.com/img/card/xx-nyarlathotep-short-cut.png",
  "Wedding Crashers":"https://pumpout2020.anyhowstep.com/img/card/xx-wedding-crashers-short-cut.png",
  "I'm so sick":"https://pumpout2020.anyhowstep.com/img/card/xx-im-so-sick.png",
  "BOOMERANG":"https://pumpout2020.anyhowstep.com/img/card/xx-boomerang.png",
  "BBoom BBoom":"https://pumpout2020.anyhowstep.com/img/card/xx-bboom-bboom.png",
  "LOVE SCENARIO":"https://pumpout2020.anyhowstep.com/img/card/xx-love-scenario.png",
  "VERY NICE":"https://pumpout2020.anyhowstep.com/img/card/xx-very-nice.png",
  "GOOD BYE":"https://pumpout2020.anyhowstep.com/img/card/xx-good-bye.png",
  "Club Night":"https://pumpout2020.anyhowstep.com/img/card/xx-club-night.png",
  "8 6":"https://pumpout2020.anyhowstep.com/img/card/xx-86.png",
  "Imagination":"https://pumpout2020.anyhowstep.com/img/card/xx-imagination.png",
  "Black Swan":"https://pumpout2020.anyhowstep.com/img/card/xx-black-swan.png",
  "Obelisque":"https://pumpout2020.anyhowstep.com/img/card/xx-obelisque.png",
  "Loki":"https://pumpout2020.anyhowstep.com/img/card/xx-loki.png",
  "Dement ~After Legend~":"https://pumpout2020.anyhowstep.com/img/card/xx-dement.png",
  "BBoom BBoom":"https://pumpout2020.anyhowstep.com/img/card/xx-bboom-bboom-full.png",
  "An Interesting View":"https://pumpout2020.anyhowstep.com/img/card/305-revive.png",
  "With My Lover":"https://pumpout2020.anyhowstep.com/img/card/304-revive.png",
  "Radetzky Can Can":"https://pumpout2020.anyhowstep.com/img/card/913-revive.png",
  "Jump":"https://pumpout2020.anyhowstep.com/img/card/C07-revive.png",
  "Ugly duck Toccata":"https://pumpout2020.anyhowstep.com/img/card/F32-revive.png",
  "Banya-P Classic Remix":"https://pumpout2020.anyhowstep.com/img/card/D36-revive.png",
  "The Little Prince (Prod. Godic)":"https://pumpout2020.anyhowstep.com/img/card/xx-the-little-prince.png",
  "Boong Boong (Feat. Sik-K) (Prod. GroovyRoom)":"https://pumpout2020.anyhowstep.com/img/card/xx-boong-boong.png",
  "Timing":"https://pumpout2020.anyhowstep.com/img/card/xx-timing.png",
  "Ice of Death":"https://pumpout2020.anyhowstep.com/img/card/xx-ice-of-death.png",
  "Xeroize":"https://pumpout2020.anyhowstep.com/img/card/xx-xeroize.png",
  "Nihilism - Another Ver.-":"https://pumpout2020.anyhowstep.com/img/card/xx-nihilism.png",
  "8 6 - FULL SONG -":"https://pumpout2020.anyhowstep.com/img/card/xx-86-full-song.png",
  "XX OPENING":"https://pumpout2020.anyhowstep.com/img/card/xx-xx-opening.png",
  "Time for the moon night":"https://pumpout2020.anyhowstep.com/img/card/xx-time-for-the-moon-night.png",
  "1949":"https://pumpout2020.anyhowstep.com/img/card/xx-1949.png",
  "Gashina":"https://pumpout2020.anyhowstep.com/img/card/xx-gashina.png",
  "YOU AND I":"https://pumpout2020.anyhowstep.com/img/card/xx-you-and-i.png",
  "Allegro Con Fuoco - FULL SONG -":"https://pumpout2020.anyhowstep.com/img/card/xx-allegro-con-fuoco-full.png",
  "Meteo5cience (GADGET mix)":"https://pumpout2020.anyhowstep.com/img/card/xx-meteo-science.png",
  "Rage of Fire":"https://pumpout2020.anyhowstep.com/img/card/xx-rage-of-fire.png",
  "Starry Night":"https://pumpout2020.anyhowstep.com/img/card/1658.png",
  "Conflict":"https://pumpout2020.anyhowstep.com/img/card/1676.png",
  "Can-can ~Orpheus in The Party Mix~":"https://pumpout2020.anyhowstep.com/img/card/16A0.png",
  "Papasito feat. KuTiNA":"https://pumpout2020.anyhowstep.com/img/card/16A1.png",
  "Fires of Destiny":"https://pumpout2020.anyhowstep.com/img/card/16A2.png",
  "The End of the World ft. Skizzo":"https://pumpout2020.anyhowstep.com/img/card/16A3.png",
  "Forgotten Vampire":"https://pumpout2020.anyhowstep.com/img/card/16A4.png",
  "Gashina":"https://pumpout2020.anyhowstep.com/img/card/16E3.png",
  "Poseidon":"https://pumpout2020.anyhowstep.com/img/card/16F5.png",
  "Black Cat":"https://pumpout2020.anyhowstep.com/img/card/1646.png",
  "King of Sales":"https://pumpout2020.anyhowstep.com/img/card/1665.png",
  "Starry Night":"https://pumpout2020.anyhowstep.com/img/card/16E4.png",
  "Rising Star":"https://pumpout2020.anyhowstep.com/img/card/1686.png",
  "Tantanmen":"https://pumpout2020.anyhowstep.com/img/card/1635.png",
  "F(R)IEND":"https://pumpout2020.anyhowstep.com/img/card/1675.png",
  "HEART RABBIT COASTER":"https://pumpout2020.anyhowstep.com/img/card/1616.png",
  "Full Moon":"https://pumpout2020.anyhowstep.com/img/card/1643.png",
  "Phalanx \"RS2018 edit\"":"https://pumpout2020.anyhowstep.com/img/card/1695.png",
  "Orbit Stabilizer":"https://pumpout2020.anyhowstep.com/img/card/1631.png",
  "CARMEN BUS":"https://pumpout2020.anyhowstep.com/img/card/1623.png",
  "Can-can ~Orpheus in The Party Mix~":"https://pumpout2020.anyhowstep.com/img/card/16F2.png",
  "Tales of Pumpnia":"https://pumpout2020.anyhowstep.com/img/card/1629.png",
  "CROSS SOUL":"https://pumpout2020.anyhowstep.com/img/card/1671.png",
  "Prime Time":"https://pumpout2020.anyhowstep.com/img/card/16D4.png",
  "Lala":"https://pumpout2020.anyhowstep.com/img/card/1674.png",
  "HANN (Alone)":"https://pumpout2020.anyhowstep.com/img/card/16D8.png",
  "Your Mind":"https://pumpout2020.anyhowstep.com/img/card/1693.png",
  "Wicked Legend":"https://pumpout2020.anyhowstep.com/img/card/1634.png",
  "Rooftop":"https://pumpout2020.anyhowstep.com/img/card/1656.png",
  "Adios":"https://pumpout2020.anyhowstep.com/img/card/1653.png",
  "After a thousand years":"https://pumpout2020.anyhowstep.com/img/card/1673.png",
  "BUNGEE (Fall in Love)":"https://pumpout2020.anyhowstep.com/img/card/1657.png",
  "HIT":"https://pumpout2020.anyhowstep.com/img/card/1654.png",
  "JANUS":"https://pumpout2020.anyhowstep.com/img/card/1607.png",
  "Lepton Strike":"https://pumpout2020.anyhowstep.com/img/card/1617.png",
  "Uranium":"https://pumpout2020.anyhowstep.com/img/card/1684.png",
  "Snapping":"https://pumpout2020.anyhowstep.com/img/card/1648.png",
  "Switronic":"https://pumpout2020.anyhowstep.com/img/card/1602.png",
  "Switronic - SHORT CUT -":"https://pumpout2020.anyhowstep.com/img/card/16F6.png",
  "Transacaglia in G-minor":"https://pumpout2020.anyhowstep.com/img/card/1604.png",
  "Indestructible":"https://pumpout2020.anyhowstep.com/img/card/1669.png",
  "VERY NICE":"https://pumpout2020.anyhowstep.com/img/card/16E7.png",
  "Cycling!":"https://pumpout2020.anyhowstep.com/img/card/1683.png",
  "Bon Bon Chocolat":"https://pumpout2020.anyhowstep.com/img/card/1661.png",
  "I’m so sick":"https://pumpout2020.anyhowstep.com/img/card/16E1.png",
  "District 1":"https://pumpout2020.anyhowstep.com/img/card/1609.png",
  "Adrenaline Blaster":"https://pumpout2020.anyhowstep.com/img/card/1627.png",
  "Danger & Danger":"https://pumpout2020.anyhowstep.com/img/card/1677.png",
  "Danger &amp; Danger":"https://pumpout2020.anyhowstep.com/img/card/1677.png",
  "POINT ZERO 2":"https://pumpout2020.anyhowstep.com/img/card/1696.png",
  "Dual Racing <RED vs BLUE>":"https://pumpout2020.anyhowstep.com/img/card/1682.png",
  "Fire Noodle Challenge":"https://pumpout2020.anyhowstep.com/img/card/16D5.png",
  "Time for the moon night":"https://pumpout2020.anyhowstep.com/img/card/16E6.png",
  "Gotta Go":"https://pumpout2020.anyhowstep.com/img/card/1666.png",
  "Iolite Sky":"https://pumpout2020.anyhowstep.com/img/card/1619.png",
  "La Cinquantaine":"https://pumpout2020.anyhowstep.com/img/card/1621.png",
  "Broken Karma (PIU Edit)":"https://pumpout2020.anyhowstep.com/img/card/1672.png",
  "Cutie Song":"https://pumpout2020.anyhowstep.com/img/card/1687.png",
  "GOOD BYE":"https://pumpout2020.anyhowstep.com/img/card/16E8.png",
  "NEKKOYA (PICK ME)":"https://pumpout2020.anyhowstep.com/img/card/16D9.png",
  "I Want U - SHORT CUT -":"https://pumpout2020.anyhowstep.com/img/card/16F4.png",
  "Jogging":"https://pumpout2020.anyhowstep.com/img/card/1641.png",
  "DESTRUCIMATE":"https://pumpout2020.anyhowstep.com/img/card/1632.png",
  "Clematis Rapsodia":"https://pumpout2020.anyhowstep.com/img/card/1633.png",
  "Stardream (feat. Romelon)":"https://pumpout2020.anyhowstep.com/img/card/1636.png",
  "Headless Chicken":"https://pumpout2020.anyhowstep.com/img/card/1688.png",
  "Over the Horizon":"https://pumpout2020.anyhowstep.com/img/card/1689.png",
  "Houseplan":"https://pumpout2020.anyhowstep.com/img/card/1692.png",
  "Baroque Virus - FULL SONG -":"https://pumpout2020.anyhowstep.com/img/card/16F9.png",
  "ERRORCODE: 0":"https://pumpout2020.anyhowstep.com/img/card/16D1.png",
  "Twist King":"https://pumpout2020.anyhowstep.com/img/card/1014.png",
  "Energy":"https://pumpout2020.anyhowstep.com/img/card/1139.png",
  "Ring Ding Dong":"https://pumpout2020.anyhowstep.com/img/card/1111.png",
  "Ring Ding Dong":"https://pumpout2020.anyhowstep.com/img/card/1137.png",
  "Deadbeat Boyfriend":"https://pumpout2020.anyhowstep.com/img/card/1227.png",
  "B.P.M. Collection 1(Auditions)":"https://pumpout2020.anyhowstep.com/img/card/1087.png",
  "B.P.M. Collection 2(Solitaries)":"https://pumpout2020.anyhowstep.com/img/card/1085.png",
  "B.P.M. Collection 3(Pumpts)":"https://pumpout2020.anyhowstep.com/img/card/1070.png",
  "B.P.M. Collection 4(etc.Mix)":"https://pumpout2020.anyhowstep.com/img/card/1093.png",
  "Bad Character":"https://pumpout2020.anyhowstep.com/img/card/F19.png",
  "Breakin' Love":"https://pumpout2020.anyhowstep.com/img/card/F21.png",
  "Chocolate":"https://pumpout2020.anyhowstep.com/img/card/F09.png",
  "U":"https://pumpout2020.anyhowstep.com/img/card/F20.png",
  "Only You":"https://pumpout2020.anyhowstep.com/img/card/F08.png",
  "I am Your Girl":"https://pumpout2020.anyhowstep.com/img/card/F07.png",
  "Come On!":"https://pumpout2020.anyhowstep.com/img/card/F18.png",
  "K-POP Boy Group RMX":"https://pumpout2020.anyhowstep.com/img/card/1130.png",
  "BRAIN POWER":"https://pumpout2020.anyhowstep.com/img/card/1697.png",
  "Full Moon - FULL SONG -":"https://pumpout2020.anyhowstep.com/img/card/16D7.png",
  "God Mode 2.0 feat. Skizzo":"https://pumpout2020.anyhowstep.com/img/card/1702.png",
  "Life is PIANO":"https://pumpout2020.anyhowstep.com/img/card/1698.png",
  "The Reverie":"https://pumpout2020.anyhowstep.com/img/card/16A7.png",
  "Adios":"https://pumpout2020.anyhowstep.com/img/card/F52.png",
  "Crossing Delta":"https://pumpout2020.anyhowstep.com/img/card/1640.png",
  "Harmagedon":"https://pumpout2020.anyhowstep.com/img/card/16A5.png",
  "Slapstick Parfait":"https://pumpout2020.anyhowstep.com/img/card/1637.png",
  "For You":"https://pumpout2020.anyhowstep.com/img/card/D11.png",
  "Repentance":"https://pumpout2020.anyhowstep.com/img/card/16A6.png",
  "Sugar Plum":"https://pumpout2020.anyhowstep.com/img/card/1613.png",
  "Telling Fortune Flower":"https://pumpout2020.anyhowstep.com/img/card/1614.png",
  "GLORIA":"https://pumpout2020.anyhowstep.com/img/card/1699.png",
  "Kokugen Kairou Labyrinth":"https://pumpout2020.anyhowstep.com/img/card/1718.png",
  "Papasito (feat.  KuTiNA) - FULL SONG -":"https://pumpout2020.anyhowstep.com/img/card/16C9.png",
  "Paved Garden":"https://pumpout2020.anyhowstep.com/img/card/1638.png",
  "Pop Sequence":"https://pumpout2020.anyhowstep.com/img/card/1639.png",
  "Ultimatum":"https://pumpout2020.anyhowstep.com/img/card/1705.png",
  "Mopemope":"https://pumpout2020.anyhowstep.com/img/card/16B1.png",
  "Re: End of a Dream":"https://pumpout2020.anyhowstep.com/img/card/16B2.png",
  "CROSS RAY (feat. 月下Lia)":"https://pumpout2020.anyhowstep.com/img/card/16B3.png",
  "Cygnus":"https://pumpout2020.anyhowstep.com/img/card/16B4.png",
  "Tropicanic":"https://pumpout2020.anyhowstep.com/img/card/16B5.png",
  "Paradoxx":"https://pumpout2020.anyhowstep.com/img/card/16B6.png",
  "Brown Sky":"https://pumpout2020.anyhowstep.com/img/card/16B7.png",
  "GOOD NIGHT - FULL SONG -":"https://pumpout2020.anyhowstep.com/img/card/16B8.png",
  "After LIKE":"https://i.imgur.com/zRMw80Z.jpg",
  "Amor Fati":"https://i.imgur.com/zfSKNlC.jpg",
  "Alone":"https://i.imgur.com/bHntd1N.jpg",
  "VECTOR":"https://i.imgur.com/cyPfNAh.jpg",
  "Versailles":"https://i.imgur.com/kkQy5Gk.jpg",
  "Showdown":"https://i.imgur.com/ILhj2C7.jpg",
  "Euphorianic":"https://i.imgur.com/KuZUdLj.jpg",
  "Jupin":"https://i.imgur.com/ZGBWthf.jpg",
  "Etude Op 10-4":"https://i.imgur.com/VXXEv3h.jpg",
  "Altale":"https://i.imgur.com/Z8Ebgf4.jpg",
  "Energy Synergy Matrix":"https://i.imgur.com/kmYlqjp.jpg",
  "Pneumonoultramicroscopicsilicovolcanoconiosis ft. Kagamine Len/GUMI":"https://i.imgur.com/fkfm3ig.jpg",
  "GOODTEK":"https://i.imgur.com/p5pPDDD.jpg",
  "CO5M1C R4ILR0AD":"https://i.imgur.com/qvZD0ar.jpg",
  "Halcyon":"https://i.imgur.com/VUTVKLK.jpg",
  "Acquire":"https://i.imgur.com/PuOS6Rs.jpg",
  "MilK":"https://i.imgur.com/OV5CAsm.jpg",
  "BOCA":"https://i.imgur.com/yGiKeA5.jpg",
  "Nxde":"https://i.imgur.com/XTWuR4I.jpg",
  "Teddy Bear":"https://i.imgur.com/mO5wkj3.jpg",
  "Beautiful Liar":"https://i.imgur.com/L6VwOVz.jpg",
  "STORM":"https://i.imgur.com/Cw5W6MP.jpg",
  "GOODBOUNCE":"https://i.imgur.com/3LrvbW4.jpg",
  "BOOOM!!":"https://i.imgur.com/wrHIACi.jpg",
  "KUGUTSU":"https://i.imgur.com/FXH0Py1.jpg",
  "Airplane":"https://i.imgur.com/Rmg8Anx.jpg",
  "MURDOCH":"https://i.imgur.com/lRjz8Z3.jpg",
  "Lohxia":"https://i.imgur.com/c96pppQ.jpg",
  "Ghroth":"https://i.imgur.com/O2boDGZ.jpg",
  "CHAOS AGAIN":"https://i.imgur.com/dk1quO1.jpg",
  "R.I.P":"https://piugame.com/data/song_img/1fdba3fa2fd7fc9c3fef0593fb67897d.png",
  "BATTLE NO.1":"https://piugame.com/data/song_img/12452411f0fddba3caf2382c9bf033f4.png",
  "Pirate":"https://piugame.com/data/song_img/a349e92cde3a219d72d082c9ed7deade.png",
  "WHISPER":"https://piugame.com/data/song_img/821e012731725917d2365e1352ad028f.png",
  "Halloween Party ~Multiverse~":"https://piugame.com/data/song_img/6175376a00ff0d561bab24934e04b782.png",
  "Lacrimosa":"https://piugame.com/data/song_img/56fbd3887c1f170ff0bab5fd5bac7320.png",
  "Galaxy Collapse":"https://piugame.com/data/song_img/f89ff0cf996937d690d7ebb7502e6c1e.png",
  "Euphorianic - SHORT CUT -":"https://piugame.com/data/song_img/a69635c7e3a9ddd1e9a2e3a05ac07d48.png",
  "ELEVEN":"https://piugame.com/data/song_img/e0cf19dbb807e5d3f2efa3db5ca163a0.png",
  "Neo Catharsis":"https://piugame.com/data/song_img/14cd5d7a3df1f12b82bccec2faea2705.png",
  "Barber's Madness":"https://piugame.com/data/song_img/d24baf611d258d15c997afc26b6380fe.png",
  "Aragami":"https://piugame.com/data/song_img/268d0e5526dc475ccf8ca90a60fcae68.png",
  "Viyella's Nightmare":"https://piugame.com/data/song_img/dde154d8a721c5d510b71c788d0b8673.png",
  "Curiosity Overdrive":"https://piugame.com/data/song_img/2cf6b048170d3446cbb27e722a1d805f.png",
  "Yo! Say!! Fairy!!!":"https://piugame.com/data/song_img/1afce79a91b11aacedfadb6f8f0c360c.png",
  "Spray":"https://piugame.com/data/song_img/d89b413ad14fae24007dfdd77a387d6c.png",
  "iRELLiA":"https://piugame.com/data/song_img/282c1e3e7427966fe98c2fb2accfa9d6.png",
  "PUPA":"https://piugame.com/data/song_img/adf1054211294efcbfb92ac97a37ec75.png",
  "TOMBOY":"https://piugame.com/data/song_img/ec342950e66150e76a00b09492dfda3c.png",
  "PANDORA":"https://piugame.com/data/song_img/45a186e942deff08bc88bf9141e2d1dd.png",
  "Bluish Rose":"https://piugame.com/data/song_img/03b6b88c054909e454b57dd7b7dfb831.png",
  "Flavor Step!":"https://piugame.com/data/song_img/2eecbab75fb2d9f0f95971ff487fc934.png",
  "TRICKL4SH 220":"https://piugame.com/data/song_img/81c807da9ac1fd29e74ab8a510976789.png",
  "See":"https://piugame.com/data/song_img/2e0daf0c0eb3b5a188a20eb0a7dd1581.png",
  "Sudden Appearance Image":"https://piugame.com/data/song_img/b2bd709009f25a9ac3618390c7b9917e.png",
  "Simon Says, EURODANCE!! (feat. Sara☆M)":"https://piugame.com/data/song_img/ecc05e7a2615a2a2770e4a8c5487eb4c.png",
  "Little Munchkin":"https://piugame.com/data/song_img/d59295bf426a99e64848df63ced40717.png",
  "STAGER":"https://piugame.com/data/song_img/07e7d5fd7daa31f830fea74250cc2186.png"
}
