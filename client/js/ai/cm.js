game.heroesAI.cm = {
  move: {
    default: 'flank'
  },
  play: function (card, cardData) {
    /*
    only use slow if N opponents or after N turns
    combo freeze
    only use ult if N opponents or after N turns
    */
    var slow = $('.enemydecks .hand .skills.cm-slow');
    var freeze = $('.enemydecks .hand .skills.cm-freeze');
    var ult = $('.enemydecks .hand .skills.cm-ult');
    if (!$('.map .enemy.cm').length) {
      slow.data('ai discard', slow.data('ai discard') + 1);
      freeze.data('ai discard', freeze.data('ai discard') + 1);
    }
    if (card.canCast(slow)) {
      cardData['can-cast'] = true;
      card.inRange(slow.data('cast range'), function (spot) {
        var targets = 0, p = 10;
        spot.inRange(slow.data('aoe range'), function (castSpot) {
          var cardInRange = $('.card.player:not(.invisible, .ghost, .dead)', castSpot);
          if (cardInRange.length) {
            targets++;
            p += parseInt((cardInRange.data('hp')-cardInRange.data('current hp'))/4);
            if (cardInRange.hasClass('towers')) p += 20;
            if (cardInRange.hasClass('units')) p -= 5;
          }
        });
        if (targets > 1) {
          cardData['cast-strats'].push({
            priority: p,
            skill: 'slow',
            card: slow,
            target: spot
          });
        }
      });
    }
    if (card.canCast(freeze)) {
      card.inRange(freeze.data('cast range'), function (spot) {
        var p = 0, cardInRange = $('.card.player:not(.invisible, .ghost, .dead, .towers)', spot);
        if (cardInRange.length) {
          cardData['can-cast'] = true;
          p = 10 + parseInt((cardInRange.data('hp')-cardInRange.data('current hp'))/4);
          if (cardInRange.hasClass('channeling')) p += 20;
          if (cardInRange.hasClass('units')) p -= 15;
          cardData['cast-strats'].push({
            priority: p,
            skill: 'freeze',
            card: freeze,
            target: cardInRange
          });
        }
      });
    }
    if (card.canCast(ult)) {
      cardData['can-cast'] = true;
      var targets = 0, p = cardData['can-attack'] ? -20 : 40;
      card.opponentsInRange(ult.data('aoe range'), function (cardInRange) {
        if (!cardInRange.hasClasses('invisible ghost dead towers')) {
          targets++;
          p += parseInt((cardInRange.data('hp')-cardInRange.data('current hp'))/4);
          if (cardInRange.hasClass('towers')) p += 20;
          if (cardInRange.hasClass('units')) p -= 5;
        }
      });
      if (targets > 1) {
        cardData['cast-strats'].push({
          priority: p,
          skill: 'ult',
          card: ult,
          target: card
        });
      }
    }
    card.data('ai', cardData);
  },
  defend: function (card, cardData) {
    // prevent clustering 
    var slow = game.data.skills.cm.slow;
    var slowSpots = [];
    card.inRange(slow['cast range'], function (spot) {
      spot.inRange(slow['aoe range'], function (castSpot) {
        if (slowSpots.indexOf(castSpot) < 0) slowSpots.push(castSpot);
      });
    });
    $.each(slowSpots, function (i, spot) {
      var spotData = spot.data('ai');
      spotData.priority -= 5;
      spotData['can-be-casted'] = true;
      spot.data('ai', spotData);
    });
    var freeze = game.data.skills.cm.freeze;
    card.inRange(freeze['cast range'], function (spot) {
      var spotData = spot.data('ai');
      spotData.priority -= 5;
      spotData['can-be-casted'] = true;
      spot.data('ai', spotData);
    });
    var ult = game.data.skills.cm.ult;
    if (game[card.side()].turn >= game.ultTurn) {
      card.inRange(ult['aoe range'], function (spot) {
        var spotData = spot.data('ai');
        spotData.priority -= 5;
        spotData['can-be-casted'] = true;
        spot.data('ai', spotData);
      });
    }
    card.data('ai', cardData);
  }
};