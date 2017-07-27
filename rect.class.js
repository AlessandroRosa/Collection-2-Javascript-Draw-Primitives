/*
    JS rect class library is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 2 of the License.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

/*  RECT class - javascript
    default rect coords are oriented as follows:
    
    x1 < x2 | y2 > y1             x1 < x2 | y1 > y2

  x1,y1 ------------> *          x1,y1    /\
    |                 |                   |
    |                 |                   |
    |                 |         <-------------------->
    |                 |                   |
   \|/                |                   |    x2,y2 
    * ------------> x2,y2                \/

    Check also the correct() member for further info about coords management
*/

// Code by Alessandro Rosa - zandor_zz@yahoo.it

var _RECT_MAX_ACCURACY = 12 ; // suggested value for all accuracy tests. Never exceed 20, which is max value allowed by javascript .toPrecision built-in function
var _RECT_ORIENTATION_SCREEN = 0, _RECT_ORIENTATION_CARTESIAN = 1 ;

if ( typeof is_array != "function" ) function is_array( _obj ) { return _obj instanceof Array ? 1 : 0 ; }
if ( typeof is_complex != "function" ) function is_complex( _obj ) { return _obj instanceof complex ? 1 : 0 ; }
if ( typeof is_integer != "function" ) function is_integer( _obj ) { return is_number( _obj ) ? ( Math.floor( _obj ) == _obj ? 1 : 0 ) : 0 ; }
if ( typeof is_number != "function" ) function is_number( _obj ) { return ( typeof _obj == "number" || _obj instanceof Number ) ; }
if ( typeof is_rational != "function" ) function is_rational( _obj ) { return is_number( _obj ) ? !is_integer( _obj ) : 0 ; }
if ( typeof is_string != "function" ) function is_string( _obj ) { return ( typeof _obj == "string" || _obj instanceof String ) ; }

if ( typeof is_point != "function" ) function is_point( _obj )   { return _obj instanceof point ? 1 : 0 ; }
if ( typeof is_rect != "function" ) function is_rect( _r ) 		   { return _r instanceof rect ? 1 : 0 ; }
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

function rect()
{
		this.customclass = arguments.callee.name ;
    // constructor may be coded as one among the following formats,
    // whose params basically follow this order 
    // [ ... coordinates ... ] , orientation, notes
    // coordinates might be input separatedly or inside an array, from a pair of points or from another rect obj
    this.orientation = _RECT_ORIENTATION_SCREEN ;
		if ( arguments.length >= 4 )
		{
       this.x1 = safe_float( arguments[0], 0 ), this.y1 = safe_float( arguments[1], 0 ) ;
		   this.x2 = safe_float( arguments[2], 0 ), this.y2 = safe_float( arguments[3], 0 ) ;
       this.set_orientation( arguments[4] );
       this.notes = safe_string( arguments[5], "" ) ;
		}
		else if ( is_point( arguments[0] ) && is_point( arguments[1] ) )
		{
       this.x1 = safe_float( arguments[0].x, 0 ), this.y1 = safe_float( arguments[0].y, 0 ) ;
		   this.x2 = safe_float( arguments[1].x, 0 ), this.y2 = safe_float( arguments[1].y, 0 ) ;
       this.set_orientation( arguments[2] );
		   this.notes = safe_string( arguments[3], "" ) ;
		}
		else if ( is_array( arguments[0] ) )
		{
			 if ( arguments[0].length == 4 )
			 {
			   this.x1 = safe_float( arguments[0][0], 0 ), this.y1 = safe_float( arguments[0][1], 0 ) ;
			   this.x2 = safe_float( arguments[0][2], 0 ), this.y2 = safe_float( arguments[0][3], 0 ) ;
			 }

       this.set_orientation( arguments[1] );
		   this.notes = safe_string( arguments[2], "" ) ;
		}
    else if ( is_rect( arguments[0] ) ) this.from_rect( arguments[0] );
    else this.notes = "" ;
		
    this.correct();
    this.w = this.width(), this.h = this.height() ;
    this.aspect_ratio = this.w / this.h ;
}

rect.prototype.width_height_constructor = function( x1, y1, width, height, _orientation, notes )
{
    this.x1 = x1, this.y1 = y1 ;
    this.x2 = x1 + width, this.y2 = y1 + height ;
    this.set_orientation( _orientation );
    this.notes = safe_string( notes, "" ) ;
    this.correct();
    this.w = width, this.h = height ;
    this.aspect_ratio = this.w / this.h ;
}

rect.prototype.set_corners = function( _pt1, _pt2, _orientation, notes )
{
    this.x1 = is_point( _pt1 ) ? _pt1.x : 0, this.y1 = is_point( _pt1 ) ? _pt1.y : 0 ;
    this.x2 = is_point( _pt2 ) ? _pt2.x : 0, this.y2 = is_point( _pt2 ) ? _pt2.y : 0 ;
    this.set_orientation( _orientation );
    this.notes = safe_string( notes, "" ) ;
    this.correct();
    this.w = this.width(), this.h = this.height() ;
    this.aspect_ratio = this.w / this.h ;
}

rect.prototype.set_rect = function( _x1, _y1, _x2, _y2, _orientation, _notes )
{
    this.x1 = _x1, this.y1 = _y1 ;
    this.x2 = _x2, this.y2 = _y2 ;
    this.set_orientation( _orientation );
    this.notes = safe_string( _notes, "" ) ;
    this.correct();
    this.w = this.width(), this.h = this.height() ;
    this.aspect_ratio = this.w / this.h ;
}

rect.prototype.includes_pt = function( _pt_x, _pt_y ) { return ( this.is_pt_inside( _pt_x, _pt_y ) || this.is_pt_onborder( _pt_x, _pt_y ) ) ? 1 : 0 ; }
rect.prototype.is_consistent = function() { return ( this.x1 < this.x2 && this.y1 > this.y2 ) ? 1 : 0 ; }
rect.prototype.is_empty = function() { return ( this.x1 == this.x2 && this.y1 == this.y2 ) ? 1 : 0 ; }
rect.prototype.is_pt_inside = function( _pt_x, _pt_y )
{
    var _y_condition = ( this.y1 <= _pt_y && _pt_y <= this.y2 && this.orientation == _RECT_ORIENTATION_SCREEN ) || ( this.y2 <= _pt_y && _pt_y <= this.y1 && this.orientation == _RECT_ORIENTATION_CARTESIAN ) ;
    return ( this.x1 <= _pt_x && _pt_x <= this.x2 && _y_condition ) ? 1 : 0 ; /* recall y1 > y2 */
}
rect.prototype.is_pt_outside = function( _pt_x, _pt_y ) { return !this.is_pt_inside( _pt_x, _pt_y ) ; }
rect.prototype.is_pt_onborder = function( _pt_x, _pt_y ) { return ( ( this.x1 == _pt_x || this.x2 == _pt_x ) && ( this.y1 == _pt_y || this.y2 == _pt_y ) ) ? 1 : 0 ; }
rect.prototype.is_pt_vertex = function( _pt_x, pt_y )
{
    if ( this.x1 == _pt_x && this.y1 == _pt_y ) return 1 ;
    else if ( this.x2 == _pt_x && this.y1 == _pt_y ) return 1 ;
    else if ( this.x2 == _pt_x && this.y2 == _pt_y ) return 1 ;
    else if ( this.x1 == _pt_x && this.y2 == _pt_y ) return 1 ;
    else return 0 ;
}

rect.prototype.is_equal_to = function( c )
{
    if ( !is_rect( c ) ) return 0 ;
    else
    {
       var _bEQ = this.x1 == c.x1 ? 1 : 0 ;
       _bEQ &= this.y1 == c.y1 ? 1 : 0 ;
       _bEQ &= this.x2 == c.x2 ? 1 : 0 ;
       _bEQ &= this.y2 == c.y2 ? 1 : 0 ;
       return _bEQ ;
    }
}

rect.prototype.is_included = function( c )
{
    var _included_x = ( this.x1 > c.x1 && c.x1 > this.x2 ) ? 1 : 0 ;
    _included_x &= ( this.x1 > c.x2 && c.x2 > this.x2 ) ? 1 : 0 ;
    var _included_y = ( this.y1 < c.y1 && c.y1 < this.y2 ) ? 1 : 0 ;
    _included_y &= ( this.y2 > c.y2 && c.y2 > this.y1 ) ? 1 : 0 ;
    return ( _included_x && _included_y ) ? 1 : 0 ;
}

rect.prototype.set_orientation = function( _o ) { _o = safe_int( _o, _RECT_ORIENTATION_SCREEN ) ; this.orientation = ( _o == _RECT_ORIENTATION_SCREEN || _o == _RECT_ORIENTATION_CARTESIAN ) ? _o : _RECT_ORIENTATION_SCREEN ; }
rect.prototype.set_left = function( x1 )  { this.x1 = x1 ; this.correct(); this.w = this.width(), this.h = this.height() ; this.aspect_ratio = this.w / this.h ; }
rect.prototype.set_right = function( x2 ) { this.x2 = x2 ; this.correct(); this.w = this.width(), this.h = this.height() ; this.aspect_ratio = this.w / this.h ; }
rect.prototype.set_top = function( y )    { this.orientation == _RECT_ORIENTATION_SCREEN ? this.y2 = y : this.y1 = y ; this.correct(); this.w = this.width(), this.h = this.height() ; this.aspect_ratio = this.w / this.h ; }
rect.prototype.set_bottom = function( y ) { this.orientation == _RECT_ORIENTATION_SCREEN ? this.y1 = y : this.y2 = y ; this.correct(); this.w = this.width(), this.h = this.height() ; this.aspect_ratio = this.w / this.h ; }

rect.prototype.get_aspect_ratio = function() { return this.aspect_ratio ; }
rect.prototype.get_orientation = function() { return this.orientation ; }
rect.prototype.get_left = function()       { return this.x1 ; }
rect.prototype.get_right = function()      { return this.x2 ; }
rect.prototype.get_top = function()        { return this.orientation == _RECT_ORIENTATION_SCREEN ? this.y2 : this.y1 ; }
rect.prototype.get_bottom = function()     { return this.orientation == _RECT_ORIENTATION_SCREEN ? this.y1 : this.y2 ; }

rect.prototype.copy = function()         { return new rect( this.x1, this.y1, this.x2, this.y2, this.orientation, this.notes ); }
rect.prototype.width = function()        { this.w = Math.abs( this.x2 - this.x1 ) ; return this.w ; } // subsequent calls can be skipped by calling this.w member
rect.prototype.height = function()       { this.h = Math.abs( this.y1 - this.y2 ) ; return this.h ; } // subsequent calls can be skipped by calling this.h member
rect.prototype.area = function()         { return this.width() * this.height() ; }
rect.prototype.perimeter = function()    { return ( 2.0 * this.width() + 2.0 * this.height() ) ; }
rect.prototype.diagonal = function()     { return Math.sqrt( this.width() * this.width() + this.height() * this.height() ) ; }
rect.prototype.offset = function( _w, _h )  { return new rect( this.x1 + _w, this.y1 + _h, this.x2 + _w, this.y2 + _h, this.orientation, this.notes ) ; }
rect.prototype.center = function() { return { 'x' : ( this.x1 + this.x2 ) / 2.0, 'y' : ( this.y1 + this.y2 ) / 2.0 } ; }
rect.prototype.center_pt = function() { return new point( ( this.x1 + this.x2 ) / 2.0, ( this.y1 + this.y2 ) / 2.0 ) ; }
rect.prototype.stretch_left = function( _w )   { return new rect( this.x1 - _w, this.y1, this.x2, this.y2, this.orientation, this.notes ) ; }
rect.prototype.stretch_top = function( _h )    { return new rect( this.x1, this.y1 + _h, this.x2, this.y2, this.orientation, this.notes ) ; }
rect.prototype.stretch_right = function( _w )  { return new rect( this.x1, this.y1, this.x2 + _w, this.y2, this.orientation, this.notes ) ; }
rect.prototype.stretch_bottom = function( _h ) { return new rect( this.x1, this.y1, this.x2, this.y2 - _h, this.orientation, this.notes ) ; }
rect.prototype.shrink = function( _size )      { _size = safe_float( _size, 0 ) ; return new rect( this.x1 + _size, this.y1 + _size, this.x2 - _size, this.y2 - _size, this.orientation, this.notes ) ; }
rect.prototype.corners = function() // returns the array of corners
{
     return [ new point( this.x1, this.y1 ), new point( this.x2, this.y1 ),
              new point( this.x2, this.y2 ), new point( this.x1, this.y2 ) ];
}

rect.prototype.center_at = function( _center_x, _center_y )
{
    this.x1 = _center_x - this.w / 2.0, this.y1 = _center_y - this.h / 2.0 ;
    this.x2 = _center_x + this.w / 2.0, this.y2 = _center_y + this.h / 2.0 ;
}

rect.prototype.set_corner = function( _pos_str_x, _pos_str_y, _x_val, _y_val )
{
    _pos_str_x = safe_string( _pos_str_x.toLowerCase(), "" ) ;
    _pos_str_y = safe_string( _pos_str_y.toLowerCase(), "" ) ;
    switch( _pos_str_x )
    {
       case "left" : this.x1 = safe_float( _x_val, 0 ) ; break ;
       case "right" : this.x2 = safe_float( _x_val, 0 ) ; break ;
       default: this.x1 = safe_float( _x_val, 0 ) ; break ;
    }
     
    switch( _pos_str_y )
    {
       case "top" :
       if ( this.orientation == _RECT_ORIENTATION_SCREEN ) this.y2 = safe_float( _y_val, 0 ) ;
       else this.y1 = safe_float( _y_val, 0 ) ;
       break ;
       case "bottom" :
       if ( this.orientation == _RECT_ORIENTATION_SCREEN ) this.y1 = safe_float( _y_val, 0 ) ;
       else this.y2 = safe_float( _y_val, 0 ) ;
       break ;
       default:
       if ( this.orientation == _RECT_ORIENTATION_SCREEN ) this.y2 = safe_float( _y_val, 0 ) ;
       else this.y1 = safe_float( _y_val, 0 ) ;
			 break ;
    }
    
    this.correct();
    this.w = this.width(), this.h = this.height() ;
    this.aspect_ratio = this.w / this.h ;
}

rect.prototype.get_corner = function( _pos_str_x, _pos_str_y )
{
    _pos_str_x = ( _pos_str_x == null || _pos_str_x == "undefined" ) ? "" : _pos_str_x.toLowerCase() ;
    _pos_str_y = ( _pos_str_y == null || _pos_str_y == "undefined" ) ? "" : _pos_str_y.toLowerCase() ;
    var _x = null, _y = null ;
     
    switch( _pos_str_x )
    {
       case "left" : _x = this.x1 ; break ;
       case "right" : _x = this.x2 ; break ;
       default: _x = this.x1 ; break ;
    }
     
    switch( _pos_str_y )
    {
       case "top" :
       if ( this.orientation == _RECT_ORIENTATION_SCREEN ) _y = this.y2 ;
       else _y = this.y1 ;
       break ;
       case "bottom" :
       if ( this.orientation == _RECT_ORIENTATION_SCREEN ) _y = this.y1 ;
       else _y = this.y2 ;
       break ;
       default:
       if ( this.orientation == _RECT_ORIENTATION_SCREEN ) _y = this.y2 ;
       else _y = this.y1 ;
			 break ;
    }
     
    return { "x" : _x, "y" : _y };
}

rect.prototype.symmetry = function( _symmetry_axis, _coord )
{
    _symmetry_axis = safe_string( _symmetry_axis.toLowerCase(), "" ) ;
    _coord = safe_int( _coord, 0 ) ;
    switch( _symmetry_axis )
    {
       case "x": // symmetry axis is parallel to y-axis
       var _w1_dist = this.x1 - _coord ;
       var _new_x1 = this.x1 - 2.0 * _w1_dist ;
       var _w2_dist = this.x2 - _coord ;
       var _new_x2 = this.x2 - 2.0 * _w2_dist ;
       var _new_rect = new rect( _new_x1, this.y1, _new_x2, this.y2, this.orientation, this.notes ) ;
       return _new_rect ;
       break ;
       case "y": // symmetry axis is parallel to x-axis
       var _h1_dist = this.y1 - _coord ;
       var _new_y1 = this.y1 - 2.0 * _h1_dist ;
       var _h2_dist = this.y2 - _coord ;
       var _new_y2 = this.y2 - 2.0 * _h2_dist ;
       var _new_rect = new rect( this.x1, _new_y1, this.x2, _new_y2, this.orientation, this.notes ) ;
       return _new_rect ;
       break ;
       default:
       return this.copy();
       break ;
    }
}

rect.prototype.from_rect = function( _rect )
{
    if ( is_rect( _rect ) )
    {
       this.x1 = _rect.x1, this.y1 = _rect.y1 ;
       this.x2 = _rect.x2, this.y2 = _rect.y2 ;
       this.set_orientation( _rect.orientation );
       this.notes = safe_string( _rect.notes, "" ) ;
       this.correct();
       this.w = this.width(), this.h = this.height() ;
       this.aspect_ratio = this.w / this.h ;
       return 1 ;
    }
    else return 0 ;
}

rect.prototype.correct = function()
{
    if ( this.x1 > this.x2 ) // for any orientation
    {
       var _x = this.swap( this.x1, this.x2 );
       this.x1 = _x['t1'], this.x2 = _x['t2'] ;
    }
      
/*  We assume this object construction 
    x1,y1 >> left top corner
    x2,y2 >> right bottom corner

    Depending on chosen orientation, y-axis shows as optioned

    down-to-up (cartesian)              up-to-down (default/screen)
    /\                                  0,0 ---------> 
    |                                   |
    |                                   |
    |                                   |
    |                                   |
    0,0 --------->                     \/

    Y-axis orientation conditions are respectively:
    y2 > y1                             y1 > y2
*/

    var _passed = this.orientation == _RECT_ORIENTATION_SCREEN ? this.y2 > this.y1 : this.y1 > this.y2 ;
    if ( !_passed )
    {
       var _y = this.swap( this.y1, this.y2 );
       this.y1 = _y['t1'], this.y2 = _y['t2'] ;
    }

    this.w = this.width(), this.h = this.height() ;
    this.aspect_ratio = this.w / this.h ;
}

rect.prototype.set_sides = function()
{
    var _side_x = 0, _side_y = 0 ;
    if ( arguments.length == 1 ) _side_x = _side_y = safe_float( arguments[0] );
    else if ( arguments.length > 1 )
    {
       _side_x = safe_float( arguments[0] ), _side_y = safe_float( arguments[1] );
    }
    else return 0 ;

    this.x2 = this.x1 + _side_x ;
    this.y2 = this.y1 + ( this.orientation == _RECT_ORIENTATION_SCREEN ? _side_x : -_side_x ) ;
    this.correct();
    this.w = this.width(), this.h = this.height() ;
    this.aspect_ratio = this.w / this.h ;
    return 1 ;
}

rect.prototype.side = function()
{
		var _x_side = Math.abs( this.x1 - this.x2 ), _y_side = Math.abs( this.y1 - this.y2 );
		return _x_side == _y_side ? [ _x_side ] : [ _x_side, _y_side ] ;
}

rect.prototype.move = function( _move_x, _move_y, _overwrite )
{
		if ( arguments.length < 2 ) return null ;
    var _point = ( arguments.length == 2 && is_point( arguments[0] ) ) ? arguments[0] : null ;
		_overwrite = safe_int( arguments.length == 2 ? arguments[1] : arguments[2], 0 );
    if ( _overwrite )
    {
        if ( is_point( _point ) )
        {
	         this.x1 += _point.x, this.x2 += _point.x, this.y1 += _point.y, this.y2 += _point.y ;
			  }
				else
				{
					 this.x1 += arguments[0], this.x2 += arguments[0], this.y1 += arguments[1], this.y2 += arguments[1] ;
				}
    }
    else
    {
       var _r = new rect() ;
       _r.from_rect( this );
       if ( is_point( _point ) )
       {
		       _r.x1 += _point.x, _r.x2 += _point.x, _r.y1 += _point.y, _r.y2 += _point.y ;
			 }
       else
			 {
					 _r.x1 += arguments[0], _r.x2 += arguments[0], _r.y1 += arguments[1], _r.y2 += arguments[1] ;
			 }
       return _r ;
    }
}
rect.prototype.write = function() { document.write( this.output() ) ; }
rect.prototype.array = function() { return [ this.x1, this.x2, this.y1, this.y2 ] ; } ;
rect.prototype.roundTo = function( _round_digits )
{
    _round_digits = safe_int( _round_digits, _RECT_MAX_ACCURACY );
    return new rect( this.x1.roundTo( _round_digits ), this.y1.roundTo( _round_digits ),
                     this.x2.roundTo( _round_digits ), this.x2.roundTo( _round_digits ),
                     this.orientation, this.notes
                   );
}

rect.prototype.output = function( _format, _round_digits, _sep )
{
    _round_digits = safe_int( _round_digits, _RECT_MAX_ACCURACY );
    _format = safe_string( _format, "std" ).trim(), _sep = safe_string( _sep, " " ) ;
    if ( _sep.length == 0 ) _sep = " " ;
    var _out = "" ;
    switch( _format.toLowerCase() )
    {
        case "std":
        case "screen":
        _out += ( this.notes.length > 0 ) ? ( this.notes + "&nbsp;" ) : "" ;
        _out += "x1:" + this.x1.roundTo(_round_digits).toString().replace( '\\.0*$', '' ) ;
        _out += _sep + "y1:" + this.y1.roundTo(_round_digits).toString().replace( '\\.0*$', '' ) ;
        _out += _sep + "x2:" + this.x2.roundTo(_round_digits).toString().replace( '\\.0*$', '' ) ;
        _out += _sep + "y2:" + this.y2.roundTo(_round_digits).toString().replace( '\\.0*$', '' ) ;
        if ( safe_size( this.notes, 0 ) > 0 ) _out += " - notes : " + this.notes ;
        break ;
        case "cartesian":
        _out += ( this.notes.length > 0 ) ? ( this.notes + "&nbsp;" ) : "" ;
        _out += "(" + this.x1.roundTo(_round_digits).toString().replace( '\\.0*$', '' ) + "," + this.y1.roundTo(_round_digits).toString().replace( '\\.0*$', '' ) + ")" ;
        _out += "(" + this.x2.roundTo(_round_digits).toString().replace( '\\.0*$', '' ) + "," + this.y2.roundTo(_round_digits).toString().replace( '\\.0*$', '' ) + ")" ;
        if ( safe_size( this.notes, 0 ) > 0 ) _out += " - notes : " + this.notes ;
        break ;
        case "html":
        _out = "<table>" ;
        _out += "<tr><td>x1</td><td WIDTH=\"3\"></td><td>"+this.x1.roundTo(_round_digits).toString().replace( '\\.0*$', '' )+"</td></tr>" ;
        _out += "<tr><td>y1</td><td WIDTH=\"3\"></td><td>"+this.y1.roundTo(_round_digits).toString().replace( '\\.0*$', '' )+"</td></tr>" ;
        _out += "<tr><td>x2</td><td WIDTH=\"3\"></td><td>"+this.x2.roundTo(_round_digits).toString().replace( '\\.0*$', '' )+"</td></tr>" ;
        _out += "<tr><td>y2</td><td WIDTH=\"3\"></td><td>"+this.y2.roundTo(_round_digits).toString().replace( '\\.0*$', '' )+"</td></tr>" ;
        if ( safe_size( this.notes, 0 ) > 0 ) _out += "<tr><td HEIGHT=\"4\"></td></tr><tr><td>Notes</td><td WIDTH=\"3\"></td><td>" + this.notes + "</td></tr>" ;
        _out += "</table>" ;
        break ;
        default:
				break ;
    }

    return _out ;
}

rect.prototype.includes = function( _rect )
{
    if ( this.orientation != _rect.orientation ) return 0 ;
    // orientation does not affect rect-in-rect inclusion
    var _includes_x = ( this.x1 < _rect.x1 && _rect.x1 < this.x2 ) ? 1 : 0 ;
    _includes_x &= ( this.x1 < _rect.x2 && _rect.x2 < this.x2 ) ? 1 : 0 ;
    var _includes_y = ( this.y1 > _rect.y1 && _rect.y1 > this.y2 ) ? 1 : 0 ;
    _includes_y &= ( this.y2 < _rect.y2 && _rect.y2 < this.y1 ) ? 1 : 0 ;
    return ( _includes_x && _includes_y ) ? 1 : 0 ;
}

rect.prototype.join_rect = function( _rect2 )
{
    if ( this.orientation != _rect.orientation ) return null ;
    var _b_found = 0, _match_counter = 0, _pts_array = [];
    var _this_rect_corners = this.corners() ;
    var _rect2_corners = _rect2.corners() ;
    var _r1 = 0, _r2 = 0 ;
    for( _r1 = 0 ; _r1 <= 3 ; _r1++ )
    {
       _b_found = 0 ;
       for( _r2 = 0 ; _r2 <= 3 ; _r2++ )
       {
          if ( _this_rect_corners[_r1].is_equal_to( _rect2_corners[_r2] ) )
          {
             _b_found = 1 ;
             _match_counter++ ;
             break ;
          }
       }

       if ( !_b_found ) _pts_array.push( _this_rect_corners[_r1] );
    }

    for( _r1 = 0 ; _r1 <= 3 ; _r1++ )
    {
       _b_found = 0 ;
       for( _r2 = 0 ; _r2 <= 3 ; _r2++ )
       {
          if ( _rect2_corners[_r1].is_equal_to( _this_rect_corners[_r2] ) )
          {
             _b_found = 1 ;
             break ;
          }
       }

       if ( !_b_found ) _pts_array.push( _rect2_corners[_r1] );
    }

    if ( _match_counter <= 1 || _match_counter == 3 ) return null ;
    else if ( _match_counter == 4 ) return this ;
    else if ( _match_counter == 2 )
    {
       // only rects sharing one side can be joint
       var _x1 = null, _y1 = null, _x2 = null, _y2 = null ;
       for( var _p = 0 ; _p < _pts_array.length ; _p++ )
       if ( _x1 == null || _pts_array[_p].x < _x1 ) _x1 = _pts_array[_p].x ;
       for( _p = 0 ; _p < _pts_array.length ; _p++ )
       if ( _x2 == null || _pts_array[_p].x > _x2 ) _x2 = _pts_array[_p].x ;
       for( _p = 0 ; _p < _pts_array.length ; _p++ )
       if ( _y1 == null || _pts_array[_p].y < _y1 ) _y1 = _pts_array[_p].y ;
       for( _p = 0 ; _p < _pts_array.length ; _p++ )
       if ( _y2 == null || _pts_array[_p].y > _y2 ) _y2 = _pts_array[_p].y ;
       return new rect( _x1, _y1, _x2, _y2, this.orientation, this.notes );
    }
}

rect.prototype.union = function( /* put any number of rect objs */ )
{
    // computes the minimal rect area including all the input ones
    var _resulting_rect = this, _rect ;
    var _new_x1 = null, _new_y1 = null, _new_x2 = null, _new_y2 = null ;
    if ( arguments[0] == null || arguments[0] == "undefined" ) return null ;

    var _input_params = new Array();
    for( var _a = 0 ; _a < arguments.length ; _a++ )
    {
       if( arguments[_a].constructor === Array ) _input_params = _input_params.concat( arguments[_a] );
       else if ( arguments[_a].constructor === rect ) _input_params.push( arguments[_a] ); 
    }
      
    for( _a = 0 ; _a < _input_params.length ; _a++ )
    {
       _rect = _input_params[_a] ;
       if ( is_rect( _rect ) && is_rect( _resulting_rect ) )
       {
          _new_x1 = Math.min( _resulting_rect.x1, _rect.x1 );
          _new_y1 = Math.min( _resulting_rect.y1, _rect.y1 );
          _new_x2 = Math.max( _resulting_rect.x2, _rect.x2 );
          _new_y2 = Math.max( _resulting_rect.y2, _rect.y2 );
          _resulting_rect = new rect( _new_x1, _new_y1, _new_x2, _new_y2, this.orientation, this.notes );
       }
       else _resulting_rect = null ;
    }
      
    return _resulting_rect ;
} 

rect.prototype.intersection = function( /* put any number of rect objs */ )
{
    // computes the minimal rect area being included by all input rects
    var _resulting_rect = this, _rect, _lr_pair, _tb_pair ;
    var _new_x1 = null, _new_y1 = null, _new_x2 = null, _new_y2 = null ;
      
    if ( arguments[0] == null || arguments[0] == "undefined" ) return null ;

    var _input_params = [];
    for( var _a = 0 ; _a < arguments.length ; _a++ )
    {
       if( arguments[_a].constructor === Array ) _input_params = _input_params.concat( arguments[_a] );
       else if ( arguments[_a].constructor === rect ) _input_params.push( arguments[_a] ); 
    }

    for( _a = 0 ; _a < _input_params.length ; _a++ )
    {
       _rect = _input_params[_a] ;
       if ( is_rect( _rect ) && is_rect( _resulting_rect ) )
       {
          if ( _rect.x2 < _resulting_rect.x1 || _rect.x1 > _resulting_rect.x2 ||
               _rect.y1 > _resulting_rect.y2 || _rect.y2 < _resulting_rect.y1  )
					_resulting_rect = null ;
          else
          {
             _lr_pair = this.interval_intersection( _resulting_rect.x1, _resulting_rect.x2, _rect.x1, _rect.x2 ) ;
             _new_x1 = _lr_pair['start'], _new_x2 = _lr_pair['end'] ;
             _tb_pair = this.interval_intersection( _resulting_rect.y1, _resulting_rect.y2, _rect.y1, _rect.y2 ) ;
             _new_y1 = _tb_pair['start'], _new_y2 = _tb_pair['end'] ;
             _resulting_rect = new rect( _new_x1, _new_y1, _new_x2, _new_y2, this.orientation, this.notes );
          }
       }
       else _resulting_rect = null ;
    }
      
    return _resulting_rect ;
}

rect.prototype.explode = function( _dx, _dy ) { return this.implode( -_dx, -_dy ); }
rect.prototype.implode = function( _dx, _dy )
{
    _dx = safe_float( _dx, 0 ), _dy = safe_float( _dy, 0 ) ;
    var _x1 = this.x1 + _dx, _x2 = this.x2 - _dx ;
    var _y1 = this.y1 + _dy, _y2 = this.y2 - _dy ;
    if ( _x1 > _x2 )
    {
        var _a = this.swap( _x1, _x2 ) ;
        _x1 = _a['t1'],  _x2 = _a['t2'] ;
    }
     
    if ( _y1 > _y2 )
    {
        var _a = this.swap( _y1, _y2 ) ;
        _y1 = _a['t1'],   _y2 = _a['t2'] ;
    }

    return new rect( _x1, _y1, _x2, _y2, this.orientation, this.notes );
}

rect.prototype.halves = function()
{
    var _mid_pt1 = new point( ( this.x1 + this.x2 ) / 2.0, this.y1 ) ;
    var _mid_pt3 = new point( ( this.x1 + this.x2 ) / 2.0, this.y2 ) ;
    return [ new rect( new point( this.x1, this.y1 ), _mid_pt3, this.orientation, this.notes ),
             new rect( _mid_pt1, new point( this.x2, this.y2 ), this.orientation, this.notes )
           ] ;
}

rect.prototype.swap = function( _t1, _t2 )
{
    var _tmp = _t1, _t1 = _t2, _t2 = _tmp ;
    return { 't1' : _t1, 't2' : _t2 } ;
}

rect.prototype.interval_intersection = function( _a1, _b1, _a2, _b2 ) // return the intersection pair
{
    if ( _a1 >= _a2 && _b1 <= _b2 )      return { "start" : _a1, "end" : _b1 } ;
    else if ( _a2 >= _a1 && _b1 <= _b2 ) return { "start" : _a2, "end" : _b1 } ;
    else if ( _a2 <= _a1 && _b1 >= _b2 ) return { "start" : _a1, "end" : _b2 } ;
    else if ( _a1 <= _a2 && _b1 >= _b2 ) return { "start" : _a2, "end" : _b2 } ;
}