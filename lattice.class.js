/*
    LATTICE rect class library is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 2 of the License.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

		WARNING : coords are oriented in cartesian mode
*/

// Code by Alessandro Rosa - zandor_zz@yahoo.it

/* such a container shall be set to tag this custom datatype for registration
   * The capital letters on the left are used to detect the tag ; 
	 * The small letters on the right must match the constructor name ;
*/
var _JS_PARSER_REGISTER_CUSTOM_DATATYPE_lattice ;

if ( typeof is_array != "function" ) function is_array( _obj ) { return _obj instanceof Array ? 1 : 0 ; }
if ( typeof is_complex != "function" ) function is_complex( _obj ) { return _obj instanceof complex ? 1 : 0 ; }
if ( typeof is_integer != "function" ) function is_integer( _obj ) { return is_number( _obj ) ? ( Math.floor( _obj ) == _obj ? 1 : 0 ) : 0 ; }
if ( typeof is_number != "function" ) function is_number( _obj ) { return ( typeof _obj == "number" || _obj instanceof Number ) ; }
if ( typeof is_rational != "function" ) function is_rational( _obj ) { return is_number( _obj ) ? !is_integer( _obj ) : 0 ; }
if ( typeof is_string != "function" ) function is_string( _obj ) { return ( typeof _obj == "string" || _obj instanceof String ) ; }

if ( typeof is_rect != "function" ) function is_rect( _obj ) { return _obj instanceof rect ? 1 : 0 ; }
if ( typeof is_lattice != "function" ) function is_lattice( _obj ) { return _obj instanceof lattice ? 1 : 0 ; }
if ( typeof is_point != "function" ) function is_point( _obj ) { return _obj instanceof point ? 1 : 0 ; }
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

function lattice()
{
		/*
				mode:
			  'scatter' >> points are distributed as wished
			  'ortho' >> points are distributed along an orthogonal grid
			  'radial' >> points are distributed radially, in sectors and radius
		*/
		this.mode = safe_string( arguments[0], "scatter" ).toLowerCase() ;

		// ortho mode params
		this.left_bottom = null ;
		this.right_top = null ;
		this.nx = 0 ;
		this.ny = 0 ;
		this.dx = 0 ;
		this.dy = 0 ;

		// radial mode params
		this.max_radius = 0 ;
		this.min_radius = 0 ;
		this.circles_n = 0 ;
		this.sectors_n = 0 ;
		this.start_angle_rad = 0 ;
		this.end_angle_rad = 0 ;
		this.center_pt = null ;

		this.pts_array = [] ;
		
		switch( this.mode )
		{
				case "scatter":
				break ;
				case "ortho":
				if ( is_point( arguments[1] ) && is_point( arguments[2] ) &&
						 is_integer( arguments[3] ) && is_integer( arguments[4] )
					 )
				{
						this.left_bottom = arguments[1] ;
						this.right_top = arguments[2] ;
						this.nx = Math.max( 1, safe_int( arguments[3], 0 ) - 1 ) ;
						this.ny = Math.max( 1, safe_int( arguments[4], 0 ) - 1 ) ;
						this.dx = ( this.right_top.x - this.left_bottom.x ) / this.nx ;
						this.dy = ( this.right_top.y - this.left_bottom.y ) / this.ny ;
						this.x_displacement = safe_int( arguments[5], 0 ) ;
						this.y_displacement = safe_int( arguments[6], 0 ) ;
						this.x_alternate = safe_int( arguments[7], 0 ) ;
						this.y_alternate = safe_int( arguments[8], 0 ) ;
						
						var _x, _y ;
						for( _y = this.left_bottom.y ; _y <= this.right_top.y ; _y += this.dy )
						{
								for( _x = this.left_bottom.x ; _x <= this.right_top.x ; _x += this.dx )
								{
										this.pts_array.push( new point( _x + ( ( this.x_alternate && _y % 2 == 0 ) ? this.x_displacement : 0 ),
																										_y + ( ( this.y_alternate && _x % 2 == 0 ) ? this.y_displacement : 0 )
																								  ) );																
								}
						}
				}
				break ;
				case "radial":
				if ( is_number( arguments[1] ) && is_number( arguments[2] ) &&
						 is_integer( arguments[3] ) && is_integer( arguments[4] ) &&
						 is_number( arguments[5] ) && is_number( arguments[6] ) &&
						 is_point( arguments[7] ) )
				{
						this.min_radius = Math.abs( safe_float( arguments[1], 0 ) );
						this.max_radius = Math.abs( safe_float( arguments[2], 0 ) );
		
						this.circles_n = Math.max( 1, Math.abs( safe_int( arguments[3], 0 ) ) );
						this.sectors_n = Math.max( 1, Math.abs( safe_int( arguments[4], 0 ) ) );
		
						this.start_angle_rad = Math.abs( safe_float( arguments[5], 0 ) );
						this.end_angle_rad = Math.abs( safe_float( arguments[6], 0 ) );

						this.center_pt = arguments[7] ;
						
						this.d_radius = ( this.max_radius - this.min_radius ) / Math.max( 1, this.circles_n ) ;
						this.d_radians = ( this.end_angle_rad - this.start_angle_rad ) / Math.max( 1, this.sectors_n ) ;
						
						var _R, _ang ;
						for( _R = this.min_radius ; _R <= this.max_radius ; _R += this.d_radius )
						{
								for( _ang = this.start_angle_rad ; _ang <= this.end_angle_rad ; _ang += this.d_radians )
								{
										this.pts_array.push( new point( _R * Math.cos( _ang ) + this.center_pt.x,
																										_R * Math.sin( _ang ) + this.center_pt.y
																									) );																
								}
						}
				}
				break ;
				default:
				break ;
		}
}

lattice.prototype.array = function() { return this.pts_array.clone() ; }
lattice.prototype.output = function( _separator )
{
		_separator = safe_string( _separator, "\r\n" );
		var _out = [] ;
		if ( this.pts_array.length > 0 )
		{
				for( var _i = 0 ; _i < this.pts_array.length ; _i++ )
				if ( is_point( this.pts_array[_i] ) ) _out.push( this.pts_array[_i].output( "plain" ) );
				return _out.join( _separator );
		}
		else return "" ;
}

lattice.prototype.build = function()
{
		switch( this.mode )
		{
				case "scatter":
				break ;
				case "ortho":
				if ( is_point( this.left_bottom ) && is_point( this.right_top ) )
				{
						this.pts_array = [] ;
				}
				break ;
				case "radial":
				break ;
				default:
				break ;
		}
}

lattice.prototype.set_mode = function( _mode ) { this.mode = safe_string( _mode, "scatter" ).toLowerCase() ; }
lattice.prototype.get_mode = function( _mode ) { return safe_string( this.mode, "scatter" ) ; }

lattice.prototype.get_left_bottom = function() { return this.left_bottom ; }
lattice.prototype.set_left_bottom = function( _lb ) { if ( is_point( _lb ) ) this.left_bottom = _lb ; }
lattice.prototype.get_right_top = function() { return this.right_top ; }
lattice.prototype.set_right_top = function( _rt ) { if ( is_point( _rt ) ) this.right_top = _rt ; }

lattice.prototype.is_pt_in_lattice = function( _pt )
{
		if ( is_array( this.pts_array ) && is_point( _pt ) )
		{
				 var _b_found = 0 ;
				 for( var _p = 0 ; _p < this.pts_array.length ; _p++ )
				 {
			 			if ( _pt.is_equal_to( this.pts_array[ _p ] ) )
			 			{
								_b_found = 1 ;
								break ; 
						}
				 }		
				 return _b_found ;
		}
}

lattice.prototype.is_equal_to = function( _l2 )
{
		if ( is_lattice( _l2 ) )
		{
				 if ( this.pts_array.length == _l2.pts_array.length )
				 {
						 var _b_ok = 1 ;
						 for( var _p = 0 ; _p < this.pts_array.length ; _p++ )
						 {
					 			if ( this.pts_array[_p].is_not_equal_to( _l2.pts_array[ _p ] ) )
					 			{
										_b_ok = 0 ;
										break ; 
								}
						 }
						 
						 return _b_ok ;
				 }
				 else return 0 ;
		}
		else return 0 ;
}

lattice.prototype.is_not_equal_to = function( _l2 ) { return is_lattice( _l2 ) ? ( this.is_equal_to( _l2 ) ? 0 : 1 ) : 1 ; }

lattice.prototype.count_pts = function() { return safe_size( this.pts_array, 0 ); }
lattice.prototype.add_pt = function()
{
		if ( this.mode == "scatter" )
		{
				var _pt, _ret_n = 0 ;
				for( var _a = 0 ; _a < arguments.length ; _a++ )
				{
						if ( is_point( arguments[_a] ) ) _pt = arguments[_a] ;
						else if ( is_string( arguments[_a] ) )
						{
								 var _ret = this.parse_complex_from_string( arguments[_a] );
								 if ( _ret != null ) _pt = new point( safe_float( _ret[0], 0 ), safe_float( _ret[1], 0 ) ) ;
								 else
								 {
							 		   var _match_ret = /([\+|\-]?\d+\.*\d*)(?:\;|\,)([\+|\-]?\d+\.*\d*)/.exec( arguments[_a] ) ;
								 		 if ( _match_ret != null ) _pt = new point( safe_float( _match_ret[1], 0 ), safe_float( _match_ret[2], 0 ) ) ;
								 }
						}
						
						if ( is_point( _pt ) )
						{
								if( !this.is_pt_in_lattice( _pt ) )
								{
										this.pts_array.push( _pt );
										_ret_n++ ;
								}
						}
				}
				
				return _ret_n ;
		}
		
		return 0 ;
}

lattice.prototype.parse_complex_from_string = function( str )
{
    if ( safe_string( str, "" ).trim().length == 0 ) return null ;
    str += "" ;
    str = str.toLowerCase().trim();
    str = str.replace( /\s+/g, "" ) ;
    str = str.replace(/[\,]/g, ".").replace(/[^\i\e\^\(\)0-9\.\-\+]/g, "").replace(/([i]{2,})/g, "i");
    // this regex pattern checks input to be a complex number in the following formats
    // a+bi, a-bi, ai+b, ai-b where both a,b are float
    var rect_fmt = new RegExp( "^([\-\+]{0,})([0-9i\.]{0,})([\-\+]{0,})([0-9i\.]{0,})$" ) ;
    var polar_fmt = new RegExp( "^([\-\+]{0,})([0-9\.]{0,})\e([\^]{1})([\(]{1})([\-\+]{0,})([0-9\.]{0,})([\i]{1})([\)]{1})$" ) ;
    var _mask = ( rect_fmt.test( str ) ? 1 : 0 ) | ( polar_fmt.test( str ) ? 2 : 0 ) ;

    if ( !_mask ) return null ;

    if ( _mask & 1 )
    {
        var complexARRAY = null, sign1 = str.charAt(0), sign2 = "" ;
        if ( sign1 != "+" && sign1 != "-" ) sign1 = "+" ;
        else str = str.substr( 1, str.length - 1 );

        if ( str.indexOf( "+" ) != -1 ) sign2 = "+" ;
        else if ( str.indexOf( "-" ) != -1 ) sign2 = "-" ;

        complexARRAY = ( sign2.length > 0 ) ? str.split( sign2 ) : new Array( str ) ;
        if ( complexARRAY.length == 2 )
        {
            var real = "0", imag = "0" ;
            if ( complexARRAY[0].indexOf( "i" ) != -1 ) imag = complexARRAY[0] ;
            else real = complexARRAY[0] ;
            if ( complexARRAY[1].indexOf( "i" ) != -1 ) imag = complexARRAY[1] ;
            else real = complexARRAY[1] ;

            imag = imag == "i" ? 1.0 : imag.replace( "i", "" );
            if ( real.length == 0 ) real = 0 ;
            if ( imag.length == 0 ) imag = 0 ;

            return [ safe_float( sign1+real, 0 ), safe_float( sign2+imag, 0 ) ] ;
        }
        else if ( complexARRAY.length == 1 )
        {
            var _d = complexARRAY[0] ;
            var _is_real = ( sign1 + _d ).indexOf( "i" ) == -1 ? 1 : 0 ;
            if ( _d == "i" ) _d = 1.0 ;
            var _v = safe_int( _is_real ? sign1+_d : ( sign1+_d ).replace( "i", "" ), 0 ) ;
            return isNaN( _v ) ? null : ( _is_real ? [ safe_float( sign1+_d ), 0.0 ] : [ 0.0, safe_float( sign1+_d ), 0 ] ) ;
        }
        else return null ;
    }
    else
    {
        var _tokens = str.split( "e" );
        var _rad = safe_float( _tokens[0], 1 );
        var _ang = _tokens[1].replace( /[\i\e\^\(\)]/g, "" ) ;    if ( _ang == "-" || _ang == "+" || _ang.length == 0 ) _ang = safe_float( _ang + "1", 0 ) ;
        var _cplx = frompolar( _rad, _ang * Math.PI ) ;
        return [ _cplx.real, _cplx.imag ] ;
    }
}