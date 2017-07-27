/*
    JS 3d point tracer class library is free software: you can redistribute it and/or modify
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

var _POINT_3D_MAX_ACCURACY = 12 ; // suggested value for all accuracy tests. Never exceed 20, which is max value allowed by javascript .toPrecision built-in function

  /* framework data type
     datatype_dev : point_3d
     datatype_public : 3d point
     constructor1 : point_3d(number,number,number)
     notes_constructor1 : x,y,z coords
     constructor2 : point_3d(point_3d)
     notes_constructor2 : copy constructor
     output method: output('std')
     comparison method: is_equal_to
     typization method : is_point_3d
     notes: 3d point
     framework data type */

if ( typeof is_array != "function" ) function is_array( _obj ) { return _obj instanceof Array ? 1 : 0 ; }
if ( typeof is_complex != "function" ) function is_complex( _obj ) { return _obj instanceof complex ? 1 : 0 ; }
if ( typeof is_integer != "function" ) function is_integer( _obj ) { return is_number( _obj ) ? ( Math.floor( _obj ) == _obj ? 1 : 0 ) : 0 ; }
if ( typeof is_number != "function" ) function is_number( _obj ) { return ( typeof _obj == "number" || _obj instanceof Number ) ; }
if ( typeof is_rational != "function" ) function is_rational( _obj ) { return is_number( _obj ) ? !is_integer( _obj ) : 0 ; }
if ( typeof is_string != "function" ) function is_string( _obj ) { return ( typeof _obj == "string" || _obj instanceof String ) ; }

if ( typeof is_point_3d != "function" ) function is_point_3d( _a ) { return _a instanceof point_3d ? 1 : 0 ; }
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

function point_3d()
{
    if ( is_point_3d( arguments[0] ) )
    {
       this.x = arguments[0].x, this.y = arguments[0].y, this.z = arguments[0].z ;
    	 this.drawcolor = safe_string( arguments[0].drawcolor, "blue" ) ;
    	 this.fillcolor = safe_string( arguments[0].fillcolor, "" ) ;
       this.notes = safe_string( arguments[0].notes, "" ) ;
    }
    else
    {
       this.x = arguments[0], this.y = arguments[1], this.z = arguments[2] ;
    	 this.drawcolor = safe_string( arguments[3], "blue" ) ;
    	 this.fillcolor = safe_string( arguments[4], "" ) ;
       this.notes = safe_string( arguments[5], "" ) ;
    }
}

point_3d.prototype.set_drawcolor = function( _clr ) { this.drawcolor = _clr ; }
point_3d.prototype.set_fillcolor = function( _clr ) { this.fillcolor = _clr ; }
point_3d.prototype.get_drawcolor = function()       { return this.drawcolor ; }
point_3d.prototype.get_fillcolor = function()       { return this.fillcolor ; }

point_3d.prototype.copy = function() { return new point_3d( this.x, this.y, this.z, this.color, this.notes ) ; }
point_3d.prototype.acquire_from_coords = function( _x, _y, _z ) { this.x = _x, this.y = _y, this.z = _z ; }
point_3d.prototype.acquire_from_point = function( _pt ) { if ( is_point_3d( _pt ) ) this.x = _pt.x, this.y = _pt.y ; }
point_3d.prototype.is_consistent = function() { return ( isNaN( this.x ) || isNaN( this.y ) || isNaN( this.z ) ) ? 0 : 1 ; }
point_3d.prototype.is_null = function() { return ( this.x == null && this.y == null && this.z == null ) ? 1 : 0 ; }
point_3d.prototype.is_equal_to = function( pt ) { return is_point_3d( pt ) ? ( ( this.x == pt.x && this.y == pt.y && this.y == pt.z ) ? 1 : 0 ) : 0 ; }
point_3d.prototype.trunc = function() { return new point_3d( safe_int( this.x ), safe_int( this.y ), safe_int( this.z ) ) ; }
point_3d.prototype.midpoint = function( _pt ) { return is_point_3d( _pt ) ? new point( ( this.x + _pt.x ) / 2.0, ( this.y + _pt.y ) / 2.0, ( this.z + _pt.z ) / 2.0 ) : null ; }

point_3d.prototype.roundTo = function( _round_digits )
{
    _round_digits = safe_int( _round_digits, _POINT_3D_MAX_ACCURACY );
    return new point_3d( this.x.roundTo( _round_digits ), this.y.roundTo( _round_digits ),
                         this.drawcolor, this.fillcolor, this.notes
                       );
}

point_3d.prototype.output = function( _format, _round_digits, _include_notes )
{
    _round_digits = safe_int( _round_digits, _POINT_3D_MAX_ACCURACY );
    _include_notes = safe_int( _include_notes, YES );
    if ( _format == null || _format == "undefined" ) _format = "std" ;
    var _out = "" ;
    switch( _format.toLowerCase() )
    {
        case "std":
        _out = ( ( this.notes.length > 0 ? this.notes + "&nbsp;" : "" ) + "x:" + this.x.roundTo(_round_digits).toString().replace( '\\.0*$', '' ) + " y:" + this.y.roundTo(_round_digits).toString().replace( '\\.0*$', '' ) + " z:" + this.z.roundTo(_round_digits).toString().replace( '\\.0*$', '' ) ) ;
        break ;
        case "cartesian":
        _out = "("+this.x.roundTo(_round_digits).toString().replace( '\\.0*$', '' ) + "," + this.y.roundTo(_round_digits).toString().replace( '\\.0*$', '' ) + "," + this.z.roundTo(_round_digits).toString().replace( '\\.0*$', '' )+")" ;
        break ;
        case "plain":
        _out = this.x.roundTo(_round_digits).toString().replace( '\\.0*$', '' ) + "," + this.y.roundTo(_round_digits).toString().replace( '\\.0*$', '' ) + "," + this.z.roundTo(_round_digits).toString().replace( '\\.0*$', '' ) ;
        break ;
        default:
        _out = ( ( this.notes.length > 0 ? this.notes + "&nbsp;" : "" ) + "x:" + this.x.roundTo(_round_digits).toString().replace( '\\.0*$', '' ) + " y:" + this.y.roundTo(_round_digits).toString().replace( '\\.0*$', '' ) + " z:" + this.z.roundTo(_round_digits).toString().replace( '\\.0*$', '' ) ) ;
        break ;
    }

    if ( safe_size( this.notes, 0 ) > 0 && _include_notes ) _out += " - notes : " + this.notes ;
    return _out ;    
}

point_3d.prototype.norm = function() { return ( this.x * this.x + this.y * this.y + this.z * this.z ) ; }
point_3d.prototype.distance = function( p2 ) { return ( p2 != null || p2 == "undefined" ) ? ( Math.sqrt( ( this.x - p2.x ) * ( this.x - p2.x ) + ( this.y - p2.y ) * ( this.y - p2.y ) + ( this.z - p2.z ) * ( this.z - p2.z ) ) ) : -1 ; }
point_3d.prototype.copy = function() { return new point_3d( this.x, this.y, this.z ) ; }
point_3d.prototype.conj_x = function() { return new point( -this.x, this.y, this.z ); }
point_3d.prototype.conj_y = function() { return new point( this.x, -this.y, this.z ); }
point_3d.prototype.conj_z = function() { return new point( this.x, this.y, -this.z ); }
point_3d.prototype.is_finite = function()			      { return ( is_infinity( this.x ) || is_infinity( this.y ) || is_infinity( this.z ) ) ? 0 : 1 ; }
point_3d.prototype.opposite = function() { return new point( -this.x, -this.y, -this.z ) ; }
point_3d.prototype.antipodal = function( _center ) { return this.shift( -_center.x, -_center.y, -_center.z ).opposite().shift( _center.x, _center.y, _center.z ) ; }
point_3d.prototype.infinity_pt = function() { return new point( Infinity, Infinity ) ; }
point_3d.prototype.origin = function() { return new point_3d( 0, 0, 0 ) ; }

point_3d.prototype.move = function() { this.shift.apply( this, arguments ) ; }
point_3d.prototype.shift = function()
{
    if ( arguments.length == 1 && is_point_3d( arguments[0] ) )
    {
       this.x += arguments[0].x, this.y += arguments[0].y, this.z += arguments[0].z ;
    }
    else if ( arguments.length == 3 && is_number( arguments[0] ) && is_number( arguments[1] ) && is_number( arguments[2] ) )
    {
       this.x += arguments[0], this.y += arguments[1], this.z += arguments[2] ;
		}
}

point_3d.prototype.rotate = function( center_pt, _rot_x_rad, _rot_y_rad, _rot_z_rad )
{
    if ( _rot_x_rad == null ) _rot_x_rad = 0.0 ;
    if ( _rot_y_rad == null ) _rot_y_rad = 0.0 ;
    if ( _rot_z_rad == null ) _rot_z_rad = 0.0 ;
    if ( !( center_pt instanceof point_3d ) ) return this ;
    var pt = this.copy();
    pt.x -= center_pt.x, pt.y -= center_pt.y, pt.z -= center_pt.z ;
      
    // rotate about z-axis
    pt.x = pt.x * Math.cos( _rot_x_rad ) - pt.y * Math.sin( _rot_x_rad ) ;
    pt.y = pt.x * Math.sin( _rot_x_rad ) + pt.y * Math.cos( _rot_x_rad ) ;

    // rotate about y-axis
    pt.x = pt.x * Math.cos( _rot_y_rad ) - pt.z * Math.sin( _rot_y_rad ) ;
    pt.z = pt.x * Math.sin( _rot_y_rad ) + pt.z * Math.cos( _rot_y_rad ) ;

    // rotate about x-axis
    pt.y = pt.y * Math.cos( _rot_z_rad ) - pt.z * Math.sin( _rot_z_rad ) ;
    pt.z = pt.y * Math.sin( _rot_z_rad ) + pt.z * Math.cos( _rot_z_rad ) ;
      
    pt.x += center_pt.x, pt.y += center_pt.y, pt.z += center_pt.z ;
    return pt ;
}

function read_3d_point()
{
    if ( arguments.length == 1 )
    {
       var _pt_str = arguments[0] + "" ;
       _pt_str = _pt_str.replaceAll( [ "(", ")", "[", "]", "{", "}" ], "" ).replaceAll( [ ":", "-", ";" ], "," );
       // assume it's in the form x,y
       var _pt_array = _pt_str.includes( "," ) ? _pt_str.split( "," ) : null ;
       return _pt_array != null ? new point_3d( safe_float( _pt_array[0], 0 ), safe_float( _pt_array[1], 0 ), safe_float( _pt_array[2], 0 ) ) : null ;
    }
    else if ( arguments.length >= 2 ) return new point_3d( safe_float( arguments[0], 0 ), safe_float( arguments[1], 0 ), safe_float( arguments[2], 0 ) ) ;
    else return null ;
}
