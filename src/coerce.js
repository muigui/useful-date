	def( 'coerce', function coerce( date_str, date_format ) {
		return buildParser( date_format )( date_str );
	}, true );

	function buildParser( date_format ) {
		var LID = Date.locale.id, i, keys, l, parsers, part, parts, re;

		if ( cache_parse[LID][date_format] ) return cache_parse[LID][date_format];

		parts = date_format.replace( re_add_nr, NOREPLACE_RB ).replace( re_add_enr, NOREPLACE_RE ).split( re_split );
		keys  = []; i = -1; l = parts.length; parsers = {}; re = [];

		while ( ++i < l ) {
			part = parts[i];
			if ( part == NOREPLACE ) {
				re.push( parts[++i] ); ++i;
				continue;
			}
			part.replace( re_compile, function( m, p1, p2, p3 ) {
				var _fn, _k, _p;
				if ( !( _p = parser[p2] ) ) return;
				if ( _p.k ) {
					keys.push( _p.k );
					if ( _p.fn ) parsers[_p.k] = _p.fn;
				}
				if ( _p.combo ) {
					_k  = pluck( _p.combo, 'k' );
					_fn = associate( pluck( _p.combo, 'fn' ), _k );
					keys.push.apply( keys, _k );
					copy( parsers, _fn, true );
				}
				if ( _p.re ) re.push( p1, _p.re, p3 );
			} );
		}
		return cache_parse[LID][date_format] = parse.bind( null, new RegExp( re.join( '' ) ), keys, parsers );
	}

	function parse( re, keys, fn, s ) {
		var date    = new Date( 0, 0, 1, 0, 0, 0, 0 ), i = -1, l = keys.length,
			parts   = s.match( re ),
			parsers = associate( parts.slice( 1 ), keys );

		while ( ++i < l )
			if ( typeof parsers[keys[i]] == 'string' && fn[keys[i]] )
				parsers[keys[i]] = fn[keys[i]]( parsers[keys[i]], parsers );

		if ( !isNaN( parsers[UNIX] ) )
			date.setTime( parsers[UNIX] );
		else {
			parse_setTime( date, parsers[HOUR], parsers[MINUTE], parsers[SECOND], parsers[MILLISECOND] );
			parse_setDate( date, parsers );
			parse_setTimezoneOffset( date, parsers[TIMEZONE] );
		}

		return date;
	}

	function parse_setDate( date, parsers ) {
		var L = Date.locale, dayweek, i = -1, l, leapyr, ordinal;

		if ( date_members.every( Object.prototype.hasOwnProperty.bind( parsers ) ) )
			return; //  only set the date if there's one to set (i.e. the format is not just for time)

		if ( isNaN( parsers[YEAR] ) )
			parsers[YEAR] = date.getFullYear();

		if ( isNaN( parsers[MONTH] ) ) {
			leapyr  = L.isLeapYear( parsers[YEAR] ) ? 1 : 0;
			ordinal = L.ordinal_day_count[leapyr];
			l       = ordinal.length;
			parsers[MONTH] = 0;

			if ( parsers[WEEK] && !parsers[DAYYEAR] ) { // give precedence to the day of the year
				dayweek = parsers[DAYWEEK];
				dayweek = isNaN( dayweek ) ? 0 : !dayweek ? 7 : dayweek;
				parsers[DAYYEAR] = ( parsers[WEEK] * 7 ) - ( 4 - dayweek );
			}

			if ( !isNaN( parsers[DAYYEAR] ) ) {
				if ( parsers[DAYYEAR] > ordinal[ordinal.length - 1] ) {
					parsers[DAYYEAR] -= ordinal[ordinal.length - 1];
					++parsers[YEAR];
				}
				while( ++i < l ) {
					if ( between_equalto( parsers[DAYYEAR], ordinal[i], ordinal[i+1] ) ) {
						parsers[MONTH] = i;
						parsers[DAY] = ordinal[i] == 0 ? parsers[DAYYEAR] : ( parsers[DAYYEAR] - ordinal[i] );
						break;
					}
				}
			}
		}

		if ( isNaN( parsers[DAY] ) )
			parsers[DAY] = 1;

		date.setYear( parsers[YEAR] );
		date.setMonth( parsers[MONTH] );
		date.setDate( parsers[DAY] );

	}
	function parse_setTime( date, hr, min, sec, ms ) {
		date.setHours( hr || 0 );
		date.setMinutes( min || 0 );
		date.setSeconds( sec || 0 );
		date.setMilliseconds( ms || 0 );
	}

	function parse_setTimezoneOffset( date, tzoffset ) {
		if ( between_equalto( tzoffset, -43200, 50400 ) )
			date.adjust( Date.SECOND, ( -date.getTimezoneOffset() * 60 ) - tzoffset );
	}
