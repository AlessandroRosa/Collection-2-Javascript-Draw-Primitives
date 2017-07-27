/*
    JS 2d point class library is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 2 of the License.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

// Code by Alessandro Rosa - zandor_zz@yahoo.it

var _POINT_2D_CLS_ERR = 0 ;
var _POINT_2D_CLS_EUCLIDEAN_ENV = 1 ;
var _POINT_2D_CLS_HALFPLANE_ENV = 2 ;
var _POINT_2D_CLS_POINCAREDISK_ENV = 3 ;
var _POINT_2D_MAX_ACCURACY = 12 ; // suggested value for all accuracy tests. Never exceed 20, which is max value allowed by javascript .toPrecision built-in function

if ( typeof is_array != "function" ) function is_array( _obj ) { return _obj instanceof Array ? 1 : 0 ; }
if ( typeof is_complex != "function" ) function is_complex( _obj ) { return _obj instanceof complex ? 1 : 0 ; }
if ( typeof is_integer != "function" ) function is_integer( _obj ) { return is_number( _obj ) ? ( Math.floor( _obj ) == _obj ? 1 : 0 ) : 0 ; }
if ( typeof is_number != "function" ) function is_number( _obj ) { return ( typeof _obj == "number" || _obj instanceof Number ) ; }
if ( typeof is_rational != "function" ) function is_rational( _obj ) { return is_number( _obj ) ? !is_integer( _obj ) : 0 ; }
if ( typeof is_string != "function" ) function is_string( _obj ) { return ( typeof _obj == "string" || _obj instanceof String ) ; }

if ( typeof is_point != "function" ) function is_point( _obj )   { return _obj instanceof point ? 1 : 0 ; }
if ( typeof is_infinity != "function" ) function is_infinity( _n ) { return _n == Infinity || _n == -Infinity ? 1 : 0 ; }
if ( typeof is_positive_infinity != "function" ) function is_positive_infinity( _n ) { return _n == Infinity ? 1 : 0 ; }
if ( typeof is_negative_infinity != "function" ) function is_negative_infinity( _n ) { return _n == -Infinity ? 1 : 0 ; }

if ( typeof safe_string != "function" ) function safe_string( _obj, _default_str ) { return ( typeof _obj == "string" || _obj instanceof String ) ? new String( _obj ).trim() : new String( _default_str + "" ).trim() ; }
if ( typeof safe_int != "function" ) function safe_int( _val, _set_if_nan ) { _val = parseInt( _val, 10 ); return isNaN( _val ) ? ( isNaN( _set_if_nan ) ? 0 : _set_if_nan ) : _val ; }
if ( typeof safe_float != "function" ) function safe_float( _val, _set_if_nan ) { _val = parseFloat( _val ); return isNaN( _val ) ? ( isNaN( _set_if_nan ) ? 0 : _set_if_nan ) : _val ; }
if ( typeof safe_size != "function" )
{
		function safe_size( _obj, _ret_val )
		{
		   if ( _ret_val == "undefined" || _ret_val == null ) _ret_val = 0 ;
		   if ( _obj == null || _obj == "undefined" ) return _ret_val ;
		   else if ( typeof _obj == "string" || _obj instanceof String || is_array( _obj ) || _obj instanceof Object ) return _obj.length ;
		   else return _ret_val ;
		}
}

function point()
{
		this.customclass = arguments.callee.name ;
    this.notes = "" ;
    // standard arguments sequence : x, y, environment, drawcolor, fillcolor, radius, notes
		if ( is_array( arguments[0] ) )
		{
       var _i = 0 ;
		   this.x = arguments[0][_i].x, this.y = arguments[0][_i].y ;
       _i++ ;
		   this.env = safe_int( arguments[0][_i], _POINT_2D_CLS_EUCLIDEAN_ENV ) ;
       _i++ ;
		   if ( is_string( arguments[0][_i] ) ) this.drawcolor = safe_string( arguments[0][_i], "blue" ) ;
       _i++ ;
		   if ( is_string( arguments[0][_i] ) ) this.fillcolor = safe_string( arguments[0][_i], "" ) ;
       _i++ ;
		   this.radius = safe_float( arguments[0][_i], 0 ) ;
       _i++ ;
		   if ( is_string( arguments[0][_i] ) ) this.notes = safe_string( arguments[0][_i], "" ) ;
		}
    else if ( is_point( arguments[0] ) )
    {
       this.x = arguments[0].x, this.y = arguments[0].y ;
       this.env = safe_int( arguments[0].env, _POINT_2D_CLS_EUCLIDEAN_ENV ) ;
       this.drawcolor = safe_string( arguments[0].drawcolor, "blue" ) ;
       this.fillcolor = safe_string( arguments[0].fillcolor, "" ) ;
       this.radius = safe_float( arguments[0].radius, 0 ) ;
       if ( is_string( arguments[0] ) ) this.notes = safe_string( arguments[0].notes, "" ) ;
    }
		else if ( arguments.length >= 2 )
		{
       var _i = 0 ;
		   if ( is_point( arguments[0] ) )
       {
          this.x = arguments[0].x, this.y = arguments[0].y ;
          _i = 1 ;
       }
       else
       {
          this.x = arguments[0], this.y = arguments[1] ;
          _i = 2 ;
       }
			 this.env = safe_int( arguments[_i], _POINT_2D_CLS_EUCLIDEAN_ENV ) ;
       _i++ ;
			 this.drawcolor = is_string( arguments[_i] ) ? safe_string( arguments[_i], "blue" ) : "" ;
       _i++ ;
			 this.fillcolor = is_string( arguments[_i] ) ? safe_string( arguments[_i], "" ) : "" ;
       _i++ ;
			 this.radius = safe_float( arguments[_i], 0 ) ;
       _i++ ;
			 if ( is_string( arguments[_i] ) ) this.notes = safe_string( arguments[_i], "" ) ;
		}
}

point.prototype.set_env = function( _env )       { this.env = safe_float( _env, _POINT_2D_CLS_EUCLIDEAN_ENV ) ; }
point.prototype.set_radius = function( _r )      { this.radius = safe_float( _r, 0 ) ; }
point.prototype.set_drawcolor = function( _clr ) { this.drawcolor = safe_string( _clr, "" ) ; }
point.prototype.set_fillcolor = function( _clr ) { this.fillcolor = safe_string( _clr, "" ) ; }
point.prototype.set_notes = function( _l )       { this.notes = safe_string( _l, "" ) ; }
point.prototype.get_env = function()             { return this.env ; }
point.prototype.get_radius = function()          { return this.radius ; }
point.prototype.get_drawcolor = function()       { return this.drawcolor ; }
point.prototype.get_fillcolor = function()       { return this.fillcolor ; }
point.prototype.get_notes = function()           { return this.notes ; }
point.prototype.get_angle = function()           { return Math.atan2( this.x, this.y ) > 0 ? Math.PI * 2.0 - Math.atan2( this.x, this.y ) : 0.0 ; } // returns in radians from 0 to + 2PI

point.prototype.copy = function() { return new point( this.x, this.y, this.color, this.notes ) ; }
point.prototype.acquire_from_coords = function( _x, _y ) { this.x = _x, this.y = _y ; }
point.prototype.acquire_from_point = function( _pt ) { if ( is_point( _pt ) ) { this.x = _pt.x, this.y = _pt.y ; } }
point.prototype.is_consistent = function() { return ( isNaN( this.x ) || isNaN( this.y ) ) ? 0 : 1 ; }
point.prototype.is_null = function() { return ( this.x == null || this.y == null ) ? 1 : 0 ; }
point.prototype.is_equal_to = function( pt ) { return ( this.x == pt.x && this.y == pt.y ) ? 1 : 0 ; }
point.prototype.is_not_equal_to = function( pt ) { return !this.is_equal_to( pt ) ; }
point.prototype.trunc = function() { return new point( safe_int( this.x, 0 ), safe_int( this.y, 0 ) ) ; }
point.prototype.midpoint = function( _pt )
{
    if ( this.env != _pt.env ) return null ;
    else
    {
       switch ( this.env )
       {
          case _POINT_2D_CLS_EUCLIDEAN_ENV:
          return ( is_point( _pt ) ) ? new point( ( this.x + _pt.x ) / 2.0, ( this.y + _pt.y ) / 2.0 ) : null ;
          break ;
       }
    }
}

point.prototype.distance = function( _pt )
{
    if ( this.env != _pt.env ) return null ;
    else
    {
       switch ( this.env )
       {
          case _POINT_2D_CLS_EUCLIDEAN_ENV:
          return ( _pt != null || _pt == "undefined" ) ? ( Math.sqrt( ( this.x - _pt.x ) * ( this.x - _pt.x ) + ( this.y - _pt.y ) * ( this.y - _pt.y ) ) ) : -1 ;
          break ;
       }
    }
}

point.prototype.shift = function()
{
    if ( arguments.length == 1 && is_point( arguments[0] ) )
    {
       this.x += arguments[0].x, this.y += arguments[0].y ;
    }
    else if ( arguments.length == 2 && is_number( arguments[0] ) && is_number( arguments[1] ) )
    {
       this.x += arguments[0], this.y += arguments[1] ;
		}
}

point.prototype.rotate = function( center_pt, _rot_rad )
{
    _rot_rad = safe_float( _rot_rad, 0.0 ) ;
    if ( !is_point( center_pt ) ) return null ;
    var pt = this.copy();
    pt.x -= center_pt.x, pt.y -= center_pt.y ;
    var _tmp_x = pt.x * Math.cos( _rot_rad ) - pt.y * Math.sin( _rot_rad ) ;
    var _tmp_y = pt.x * Math.sin( _rot_rad ) + pt.y * Math.cos( _rot_rad ) ;
    pt.x = _tmp_x, pt.y = _tmp_y ;
    pt.x += center_pt.x, pt.y += center_pt.y ;
    return pt ;
}

point.prototype.roundTo = function( _round_digits )
{
    _round_digits = safe_int( _round_digits, Math.PI );
    return new point( this.x.roundTo( _round_digits ), this.y.roundTo( _round_digits ),
                      this.env, this.drawcolor, this.fillcolor, this.radius, this.notes );
}

point.prototype.output = function( _format, _round_digits, _include_notes )
{
    _round_digits = safe_int( _round_digits, _POINT_2D_MAX_ACCURACY );
    _include_notes = safe_int( _include_notes, 1 );
    if ( _format == null || _format == "undefined" ) _format = "std" ;
    var _out = "" ;
    switch( _format )
    {
        case "std":
        _out += ( ( this.notes.length > 0 ? this.notes + " " : "" ) + "x:" + this.x.roundTo(_round_digits).toString().replace( '\\.0*$', '' ) + " y:" + this.y.roundTo(_round_digits).toString().replace( '\\.0*$', '' ) ) ;
        break ;
        case "cartesian":
        _out += "("+this.x.roundTo(_round_digits).toString().replace( '\\.0*$', '' ) + "," + this.y.roundTo(_round_digits).toString().replace( '\\.0*$', '' )+")" ;
        break ;
        case "plain":
        _out += this.x.roundTo(_round_digits).toString().replace( '\\.0*$', '' ) + "," + this.y.roundTo(_round_digits).toString().replace( '\\.0*$', '' ) ;
        break ;
        default:
        _out += ( ( this.notes.length > 0 ? this.notes + "&nbsp;" : "" ) + "x:" + this.x.roundTo(_round_digits).toString().replace( '\\.0*$', '' ) + " y:" + this.y.roundTo(_round_digits).toString().replace( '\\.0*$', '' ) ) ;
        break ;
    }

    if ( safe_size( this.notes, 0 ) > 0 && _include_notes ) _out += " - notes : " + this.notes ;
    return _out ;
}

point.prototype.ortho_lattice = function( _n_x, _n_y, _shift_x, _shift_y )
{
		// the current point is assumed as the center of the lattice
		_n_x = Math.max( 0, safe_int( _n_x, 0 ) ), _n_y = Math.max( 0, safe_int( _n_y, 0 ) ) ;
		_shift_x = safe_float( _shift_x, 0 ), _shift_y = safe_float( _shift_y, 0 ) ;

		var _take_back_x = _n_x % 2 == 0 ? ( -_shift_x / 2.0 - _shift_x * ( _n_x / 2 - 1 ) ) : ( -_shift_x * Math.floor( _n_x / 2.0 ) ) ;
		var _take_back_y = _n_y % 2 == 0 ? ( -_shift_y / 2.0 - _shift_y * ( _n_y / 2 - 1 ) ) : ( -_shift_y * Math.floor( _n_y / 2.0 ) ) ;
		var _lattice = [], _x, _y, _pt = this.shift( _take_back_x, _take_back_y, 0 ) ;
		for( _y = 0 ; _y < _n_y ; _y++ )
		{
				for( _x = 0 ; _x < _n_x ; _x++ ) _lattice.push( _pt.shift( _x * _shift_x, _y * _shift_y, 0 ) );
		}
		return _lattice.clone();
}

point.prototype.circ_lattice = function( _n_sectors, _n_circles, _shift, _from_rad, _to_rad )
{
    _n_sectors = safe_int( _n_sectors, 0 ), _n_circles = safe_int( _n_circles ) ;
    _from_rad = safe_float( _from_rad, 0 ), _to_rad = safe_float( _to_rad, 0 ) ;
    _shift = Math.max( 0, safe_float( _shift, 0 ) ) ;
    if ( _n_sectors == 0 || _n_circles == 0 || _shift == 0 ) return [];
    else
    {
       // we construct a lattice center at the origin
       var _start_pt = new point( 0, 0 ), _rot_pt = new point(), _rot_angle = 2.0 * Math.PI / _n_sectors, _c, _s ;
       var _lattice = [ _start_pt ], _rad_angle = 0.0 ;
       for( _c = 1 ; _c <= _n_circles ; _c++ )
       {
         _rot_pt.acquire_from_point( _start_pt ) ;
         _rot_pt.x += _c * _shift ;
         for( _s = 0 ; _s < _n_sectors ; _s++ )
         {
            _rad_angle = _rot_angle * _s ;
            if ( ( _from_rad == _to_rad && _from_rad == 0 && _to_rad == 0 ) || ( _rad_angle >= _from_rad && _rad_angle <= _to_rad ) )
            _lattice.push( _rot_pt.rotate( _start_pt, _rad_angle ) );
         }
       }

       // shift all points back as if the center is the calling point object
       for( var _l = 0 ; _l < _lattice.length ; _l++ )
       {
          _lattice[ _l ].x = _lattice[ _l ].x + this.x ;
          _lattice[ _l ].y = _lattice[ _l ].y + this.y ;
       }

       return _lattice ;
    }
}

point.prototype.norm = function() { return ( this.x * this.x + this.y * this.y ) ; }
point.prototype.radius = function() { return Math.sqrt( this.norm() ) ;	}
point.prototype.angle = function() { return Math.atan2( this.y, this.x ); } // returns in radians from -PI to +PI
point.prototype.angle2PI = function() { return Math.PI * 2.0 - Math.atan2( this.y, this.x ); } // returns in radians from 0 to + 2PI
point.prototype.argument = function() { return this.angle() ; } // alias of angle
point.prototype.argument2PI = function() { return this.angle2PI() ; } // alias of angle2PI
point.prototype.conj = function() { return new point( this.x, -this.y ); }
point.prototype.conj_x = function() { return new point( -this.x, this.y ); }
point.prototype.is_finite = function() { return ( is_infinity( this.x ) || is_infinity( this.y ) ) ? 0 : 1 ; }
point.prototype.opposite = function() { return new point( -this.x, -this.y ) ; }
point.prototype.antipodal = function( _center ) { return is_point( _center ) ? this.shift( -_center.x, -_center.y, 0 ).opposite().shift( _center.x, _center.y, 0 ) : null ; }
point.prototype.infinity_pt = function() { return new point( Infinity, Infinity ) ; }
point.prototype.origin = function() { return new point( 0, 0 ) ; }

// EXTERNAL FUNCTIONS
function read_2D_point()
{
    if ( arguments.length == 1 )
    {
       if ( is_array( arguments[0] ) ) return new point( safe_float( arguments[0][0], 0 ), safe_float( arguments[0][1], 0 ) ) ;
       else if ( is_string( arguments[0] ) )
       {
           var _pt_str = safe_string( arguments[0], "" ) ;
           _pt_str = _pt_str.replaceAll( [ "(", ")", "[", "]", "{", "}" ], "" ).replaceAll( [ ":", ";" ], "," );
           // assume the format is x,y
           if ( _pt_str.includes( "," ) )
           {
              var _pt_array = _pt_str.split( "," ) ;
              if ( _pt_array.length != 2 && _pt_array.length != 3 ) return null ;
              if ( _pt_array.length == 2 ) return new point( safe_float( _pt_array[0], 0 ), safe_float( _pt_array[1], 0 ) ) ;
              else if ( _pt_array.length == 3 ) return new point( safe_float( _pt_array[0], 0 ), safe_float( _pt_array[1], 0 ), null, null, 0, safe_string( _pt_array[2], 0 ) ) ;
           }
           else return null ;
       }
       else return null ;
    }
    else if ( arguments.length == 2 ) return new point( safe_float( arguments[0], 0 ), safe_float( arguments[1], 0 ) ) ;
    else if ( arguments.length == 3 ) return new point( safe_float( arguments[0], 0 ), safe_float( arguments[1], 0 ), null, null, 0, safe_string( arguments[2], "" ) ) ;
    else return null ;
}

function harmonic_test( A, B ) { return ( A.x * A.y * B.x * B.y == -1 ) ? 1 : 0 ; }
function couple_collinear_test( A, B ) { return ( A.x == B.x || A.y == A.y ) ? 1 : 0 ; }
function triplet_collinear_test( A, B, C )
{
    if ( ( B.x == A.x && B.x == C.x ) || ( B.y == A.y && B.y == C.y ) ) return 1 ;
    else
    {
       // compute slopes
       var slope_1 = ( B.y - A.y ) / ( B.x - A.x ) ;
       var slope_2 = ( B.y - C.y ) / ( B.x - C.x ) ;
       if ( slope_1 != slope_2 ) return 0 ;
       else
       {
          // let y = mx + q be the straight-line equation
          var q = A.y - slope_1 * A.x ;
          // use slope_1 of the pair (A,B) to test C
          return ( C.y == ( slope_1 * C.x + q ) ) ? 1 : 0 ;
       }
    }
}