// this class requires array.js, 2d.point.class.js or 3d.point.class.js

/*
    JS polygon class library is free software: you can redistribute it and/or modify
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

  /* framework data type
     datatype_dev : polygon
     datatype_public : polygon
     constructor1 : polygon(array)
     notes_constructor1 : polygon vertexes (array of points or complex values)
     constructor2 : polygon(point,number,number)
     notes_constructor2 : center point, n vertexes, side length
     constructor3 : polygon(polygon)
     notes_constructor3 : copy constructor
     output method: output('std')
     comparison method: is_equal_to
     typization method : is_polygon
     notes: 2d polygon
     framework data type */

var _POLYGON_MAX_ACCURACY = 12 ; // suggested value for all accuracy tests. Never exceed 20, which is max value allowed by javascript .toPrecision built-in function
var _POLYGON_ERR_INVALID_VALUE = -1 ;
var _POLYGON_ERR_NONE = 0.0 ;
var _POLYGON_ERR_MISSING_INPUT_ARGS = 0.1 ;
var _POLYGON_ERR_MISSING_INPUT_VERTEXES = 0.2 ;
var _POLYGON_ERR_MISSING_CANVAS_OBJ_REF = 0.3 ;
var _POLYGON_ERR_PREVIOUS_ERROR = 0.4 ;

if ( typeof degree != "function" )    function degree( rad ) { return  ( rad % ( 2.0 * Math.PI ) ) / Math.PI * 180.0 ; }
if ( typeof radians != "function" )   function radians( deg ) { return  ( deg % ( 360.0 ) ) / 180.0 * Math.PI ; }

if ( typeof is_array != "function" ) function is_array( _obj ) { return _obj instanceof Array ? 1 : 0 ; }
if ( typeof is_complex != "function" ) function is_complex( _obj ) { return _obj instanceof complex ? 1 : 0 ; }
if ( typeof is_integer != "function" ) function is_integer( _obj ) { return is_number( _obj ) ? ( Math.floor( _obj ) == _obj ? 1 : 0 ) : 0 ; }
if ( typeof is_number != "function" ) function is_number( _obj ) { return ( typeof _obj == "number" || _obj instanceof Number ) ; }
if ( typeof is_rational != "function" ) function is_rational( _obj ) { return is_number( _obj ) ? !is_integer( _obj ) : 0 ; }
if ( typeof is_string != "function" ) function is_string( _obj ) { return ( typeof _obj == "string" || _obj instanceof String ) ; }

if ( typeof is_html_canvas != "function" ) function is_html_canvas( _obj ) { return _obj instanceof HTMLCanvasElement; }
if ( typeof is_polygon != "function" ) function is_polygon( _a ) { return _a instanceof polygon ? 1 : 0 ; }

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

function polygon()
{
    this.err_no = _POLYGON_ERR_NONE ;
    this.error_log = [];

    if ( arguments.length == 0 )
    {
       this.canvas_obj = null ;
       this.vertex_array = [] ;
       this.center = null ;
       this.n_sides = 0 ;
       this.side = 0 ;
       this.log_add( "missing input arcs for class constructor" );
       this.err_no = _POLYGON_ERR_MISSING_INPUT_ARGS ;
    }
    else if ( is_polygon( arguments[0] ) )
    {
       this.canvas_obj = arguments[0].canvas_obj ;
       this.vertex_array = arguments[0].vertex_array.clone() ;
       this.center = arguments[0].center ;
       this.n_sides = arguments[0].n_sides ;
       this.side = arguments[0].side ;
    }
    else
    {
       this.canvas_obj = null ;
       this.vertex_array = [] ;
       this.center = null ;
       this.n_sides = 0 ;
       this.side = 0 ;

       if ( is_array( arguments[0] ) && arguments.length == 1 ) // array of points
       {
					 for( var _i = 0 ; _i < arguments[0].length ; _i++ )
					 {
						  if ( is_point( arguments[0][_i] ) ) this.vertex_array.push( arguments[0][_i] );
						  if ( is_complex( arguments[0][_i] ) ) this.vertex_array.push( new point( arguments[0][_i].real, arguments[0][_i].imag ) );
						  else if ( is_array( arguments[0][_i] ) ) this.vertex_array.push( new point( arguments[0][_i][0], arguments[0][_i][1] ) );
					 }
						 
					 this.n_sides = this.vertex_array.length ; 
					 this.center = this.centroid() ;
       }
       else if ( ( is_point( arguments[0] ) || is_array( arguments[0] ) ) &&  // center coords
									is_number( arguments[1] ) && // number of sides
								  is_number( arguments[2] ) )  // side length
       {
           /* create an equilateral polygon whose vertexes are distributed
              uniformly on a circle by an angle of PI/n and centered at a given point
           */

           this.center = is_point( arguments[0] ) ? arguments[0] : new point( safe_float( arguments[0][0], 0 ), safe_float( arguments[0][1], 0 ) ) ;
           this.n_sides = safe_int( arguments[1], 0 ) ;
           this.side = safe_float( arguments[2], 0 ) ;
           // assume it's centered at the origin by default
           var _ROTATION_ANGLE = 2.0 * Math.PI / this.n_sides ;
           var _pt_x = safe_float( this.side, 0 ), _pt_y = 0 ;
           var _cos = Math.cos( _ROTATION_ANGLE ), _sin = Math.sin( _ROTATION_ANGLE );
             
           this.vertex_array.push( new point( _pt_x, _pt_y ) );
           for( var _i = 1 ; _i < this.n_sides ; _i++ )
					 this.vertex_array.push( new point( this.vertex_array[_i-1].x * _cos - this.vertex_array[_i-1].y * _sin,
																						  this.vertex_array[_i-1].x * _sin + this.vertex_array[_i-1].y * _cos ) );

					 // closing the polygon
					 this.vertex_array.push( new point( this.vertex_array[0].x, this.vertex_array[0].y ) );
					 // translation by center coords
           for( _i = 0 ; _i < this.vertex_array.length ; _i++ ) this.vertex_array[_i].shift( this.center.x, this.center.y );
       }
       else
       {
           this.err_no = _POLYGON_ERR_MISSING_INPUT_VERTEXES ;
           this.log_add( "missing input vertexes for class constructor" ) ;
       }
    }
}

polygon.prototype.array = function() { return this.vertex_array.clone() ; }
polygon.prototype.points = function() { return this.array() ; }
polygon.prototype.log_add = function( _err_text ) { _err_text = safe_string( _err_text, "" ) ; if ( _err_text.length > 0 ) this.error_log.push( _err_text ) ; }
polygon.prototype.log_return_as_string = function( _line_sep ) { _line_sep = safe_string( _line_sep, "" ) ; return this.error_log.join( _line_sep ) ; }
polygon.prototype.log_pick_last_error = function()             { return this.error_log.length > 0 ? this.error_log[ this.error_log.length - 1 ] : "" ; }
polygon.prototype.log_return_as_array = function()             { return this.error_log.clone() ; }
polygon.prototype.get_vertexes = function() { return this.vertex_array.clone() ; }
polygon.prototype.get_center = function() { return this.center ; }
polygon.prototype.side = function() { if ( !this.is_regular() ) this.log_add( "can't return unique side value for irregular polygon" ) ; return this.is_regular() ? this.vertex_array[0].distance( this.vertex_array[1] ) : _POLYGON_ERR_INVALID_VALUE ; }
polygon.prototype.set_canvas = function( _cnv ) { if ( is_html_canvas( _cnv ) ) this.canvas_obj = _cnv ; else this.log_add( "invalid input canvas obj" ); }
polygon.prototype.clone = function()
{
		var _polygon = new polygon();
		_polygon.canvas_obj = this.canvas_obj ;
		_polygon.center = this.center ;
		_polygon.n_sides = this.n_sides ;
		_polygon.side = this.side ;
		_polygon.err_no = _POLYGON_ERR_NONE ; 
		_polygon.vertex_array = this.vertex_array.clone() ;
		return _polygon ;
}

polygon.prototype.is_equal_to = function( _gon )
{
		if ( is_polygon( _gon ) )
		{
				if ( this.n_sides == _gon.n_sides )
				{
						var _b_equal = 1 ;
						for( var _i = 0 ; _i < this.n_sides ; _i++ )
						{
								if ( !( this.vertex_array[_i].is_equal_to( _gon.vertex_array[_i] ) ) )
								{
										_b_equal = 0 ;
										break ;
								}
						}
						return _b_equal ;
				}
				else return 0 ;
		}
		else return 0 ;
}

polygon.prototype.is_not_equal_to = function( _gon ) { return !this.is_equal_to( _gon ); }
polygon.prototype.output = function( _round_digits, _linebreak_cmd )
{
    _round_digits = safe_int( _round_digits, _POLYGON_MAX_ACCURACY );
    _linebreak_cmd = safe_string( _linebreak_cmd, "\n" );
		var _v_n = safe_size( _polygon.vertex_array, 0 );
		if ( _v_n > 0 )
		{
				var _out = "" ;
				for( var _v = 1 ; _v < _v_n ; _v++ )
				_out += ( _linebreak_cmd + "(" + this.vertex_array[_v-1].x.roundTo(_round_digits).toString().replace( '\\.0*$', '' ) + "," + this.vertex_array[_v-1].roundTo(_round_digits).toString().replace( '\\.0*$', '' ) + ")-(" + this.vertex_array[_v].roundTo(_round_digits).toString().replace( '\\.0*$', '' ) + "," + this.vertex_array[_v].roundTo(_round_digits).toString().replace( '\\.0*$', '' ) + ")" ) ; 
		    return _out ; 
		}
		else return "empty polygon";
}

polygon.prototype.move = function() { this.shift.apply( this, arguments ) ; }
polygon.prototype.shift = function()
{
		var _pt = null ;
		if ( is_point( arguments[0] ) ) _pt = arguments[0] ;
		else if ( is_array( arguments[0] ) ) _pt = new point( arguments[0][0], arguments[0][1] );
		else if ( arguments.length == 0 ) _pt = new point( safe_float( arguments[0], 0 ), safe_float( arguments[1], 0 ) );
    for( var _i = 0 ; _i < this.vertex_array.length ; _i++ ) this.vertex_array[_i].shift( _pt.x, _pt.y );
}

polygon.prototype.rotate = function( _rad )
{
    var _cos = Math.cos( _rad ), _sin = Math.sin( _rad );
    for( var _i = 0 ; _i < this.vertex_array.length ; _i++ ) this.vertex_array[_i].shift( -this.center.x, -this.center.y );
    
    var _pt = new point();
		for( _i = 0 ; _i < this.vertex_array.length ; _i++ )
    {
			 _pt.x = this.vertex_array[_i].x * _cos - this.vertex_array[_i].y * _sin ;
			 _pt.y = this.vertex_array[_i].x * _sin + this.vertex_array[_i].y * _cos ;
			 this.vertex_array[_i].x = _pt.x ;
			 this.vertex_array[_i].y = _pt.y ;
		}

    for( _i = 0 ; _i < this.vertex_array.length ; _i++ )
		this.vertex_array[_i].shift( this.center.x, this.center.y );
}

polygon.prototype.perimeter = function()
{
    if ( is_array( this.vertex_array ) )
    {
       if ( this.vertex_array.length <= 1 )
       {
          this.err_no = _POLYGON_ERR_MISSING_INPUT_VERTEXES ;
          this.log_add( "missing input vertexes for perimeter calcutation" ) ;
          return 0 ;
       }
       else
       {
          var _perimeter = 0 ;
          for( var _p = 1 ; _p < this.vertex_array.length ; _p++ ) _perimeter += this.vertex_array[_p-1].distance( this.vertex_array[_p] );
          this.err_no = _POLYGON_ERR_NONE ;
          return _perimeter ;
       }
    }
    else
    {
       this.log_add( "missing input vertexes for perimeter calcutation" ) ;
       this.err_no = _POLYGON_ERR_MISSING_INPUT_VERTEXES ;
       return 0 ;
    }
}

polygon.prototype.is_regular = function( _tolerance )
{
    var _dist = 0, _compare_dist = 0, _prec_pt, _curr_pt, _ret = 1 ;
    _tolerance = safe_float( _tolerance, Math.pow( 10, -3 ) ) ;
    if ( this.n_sides > 0 )
    {
       for( var _i = 1 ; _i < this.n_sides ; _i++ )
       {
          _prec_pt = this.vertex_array[_i-1] ;
          _curr_pt = this.vertex_array[_i] ;
          if ( _i == 0 ) _compare_dist = _prec_pt.distance( _curr_t );
          else
          {
             _dist = _prec_pt.distance( _curr_t );
             if ( Math.abs( _dist - _compare_dist ) > _tolerance )
             {
                _ret = 0 ;
                break ;
             }
          }
       }
    }
    else _ret = 0 ;
    return _ret ;
}

polygon.prototype.apothem = function()
{
    if ( this.regular() ) return this.side() / ( 2 * Math.tan( Math.PI / n ) )
    else
    {
       this.log_add( "Can't return apothem for irregular polygon" );
       this.err_no = _POLYGON_ERR_INVALID_VALUE ;
       return _POLYGON_ERR_INVALID_VALUE ;
    }
}

polygon.prototype.is_concave = function() { return !this.is_convex() ; }
polygon.prototype.is_convex = function()
{
		// For each set of three adjacent points A, B, C,
    // find the cross product AB · BC. If the sign of
    // all the cross products is the same, the angles
    // are all positive or negative (depending on the
    // order in which we visit them) so the polygon
    // is convex.
    if ( this.n_sides > 0 )
    {
       var fail = false, ok = false, A, B, C, cross_product = 0 ;
       for ( A = 0; A < this.n_sides ; A++ )
       {
          B = ( A + 1 ) % num_points, C = ( B + 1 ) % num_points ;
          cross_product = this.cross_product_length( this.vertex_array[A].x, this.vertex_array[A].y,
    																                 this.vertex_array[B].x, this.vertex_array[B].y,
    																                 this.vertex_array[C].x, this.vertex_array[C].y );
          if ( cross_product < 0 ) fail = true;
          else if ( cross_product > 0 ) ok = true;
          if ( fail && ok ) return 0;
       }
    
       return 1 ;
    }
    else
    {
       this.log_add( "Can't perform convexity check: missing vertexes" );
       this.err_no = _POLYGON_ERR_INVALID_VALUE ;
       return _POLYGON_ERR_INVALID_VALUE ;
    }
		// http://csharphelper.com/blog/2014/07/determine-whether-a-polygon-is-convex-in-c/
}

polygon.prototype.cross_product_length = function( Ax, Ay, Bx, By, Cx, Cy )
{
    // Get the vectors' coordinates.
    var BAx = Ax - Bx, BAy = Ay - By ;
    var BCx = Cx - Bx, BCy = Cy - By ;
    // Calculate the Z coordinate of the cross product.
    return BAx * BCy - BAy * BCx ;
}

polygon.prototype.barycenter = function() { return this.centroid(); }
polygon.prototype.centroid = function()
{
		if ( this.n_sides > 0 )
    {
        var centroid = new point( 0, 0 );
        var signedArea = 0.0 ;
        var x0 = 0.0, y0 = 0.0 ; // Current vertex X, Y
        var x1 = 0.0, y1 = 0.0 ; // Next vertex X, Y
        var a = 0.0 ;  // Partial signed area
    
    		var vertices = this.vertex_array ;
    		for ( var i = 0; i < this.n_sides - 1; ++i )
        {
            x0 = vertices[i].x, y0 = vertices[i].y;
            x1 = vertices[i+1].x, y1 = vertices[i+1].y;
            a = x0*y1 - x1*y0 ;
            signedArea += a;
            centroid.x += (x0 + x1)*a, centroid.y += (y0 + y1)*a;
        }
    
        // For all vertices except last
        i = 0;
    
        // Do last vertex
        x0 = vertices[i].x, y0 = vertices[i].y;
        x1 = vertices[0].x, y1 = vertices[0].y;
        a = x0*y1 - x1*y0;
        signedArea += a;
        centroid.x += (x0 + x1)*a, centroid.y += (y0 + y1)*a;
    
        signedArea /= 2.0 ;
        centroid.x /= ( 6.0 * signedArea );
        centroid.y /= ( 6.0 * signedArea );
        return centroid ;
    }
    else
    {
        this.log_add( "Can't calculate centroid: missing vertexes" );
        this.err_no = _POLYGON_ERR_INVALID_VALUE ;
        return null ;
    }
}

polygon.prototype.triangulation = function()
{
    if ( this.is_regular() )
    {
       if ( is_html_canvas( this.canvas_obj ) )
       {
           var _centroid = this.centroid ;
           var _drawcolor = safe_string( arguments[0], "" );
           if ( this.vertex_array.length > 0 )
           {
              var _ctx = this.canvas_obj.getContext( "2d" ), _pt ;
              _ctx.beginPath();
              for( var _v = 0 ; _v < this.vertex_array.length ; _v++ )
              {
                 _pt = this.vertex_array[_v] ;
                 _ctx.moveTo( _centroid.x, _centroid.y );
                 _ctx.lineTo( _pt.x, _pt.y );
                 _ctx.strikeStyle( _drawcolor );
                 _ctx.strike();
              }
              _ctx.closePath();
           }
       }
       return 1 ;
    }
    else
    {
       this.log_add( "Can't perform triangulation: irregular polygon" );
       this.err_no = _POLYGON_ERR_INVALID_VALUE ;
       return 0 ;
    }
}

polygon.prototype.area = function()
{
    if ( is_array( this.vertex_array ) )
    {
       if ( this.vertex_array.length < 3 )
       {
          this.err_no = _POLYGON_ERR_MISSING_INPUT_VERTEXES ;
          return 0 ;
       }
       else
       {
          // this formula allows to compute the area of a convex or concave polygon
          var _pts = this.vertex_array.clone() ;
          var _area = 0, _n_pts = _pts.length ;
          var _j = _n_pts - 1;  // initializes the last vertex so it's the 'previous' one to the first
          for ( var _i = 0; _i < _n_pts - 1; _i++ )
          {
							_area += _pts[_j].x * _pts[_i].x - _pts[_j].y * _pts[_i].y ;
              _j = _i;  // when _i = 0, _j is the last index. For _i >= 1, j = _i - 1
          }
          return Math.abs( _area ) / 2.0 ;
       }
    }
    else
    {
       this.log_add( "Can't calculate area: missing vertexes" );
       this.err_no = _POLYGON_ERR_MISSING_INPUT_VERTEXES ;
       return 0 ;
    }
}

polygon.prototype.draw_point = function()
{
		var _pt = null ;
		if ( is_point( arguments[0] ) ) _pt = arguments[0] ;
		else if ( is_array( arguments[0] ) ) _pt = new point( safe_float( arguments[0][0], 0 ), safe_float( arguments[0][1], 0 ) ) ;
		else 
		{
			 var _i = safe_int( arguments[0], -1 ) ;
			 if ( _i != -1 && _i >= 0 && _i < this.n_sides ) _pt = this.vertex_array[ _i ] ;
		}
		
		if ( _pt == null )
    {
       this.log_add( "Can't draw point: missing input coords" );
       this.err_no = _POLYGON_ERR_INVALID_VALUE ;
       return 0 ;
    }
		else if ( is_html_canvas( this.canvas_obj ) )
		{
			 var _ctx = this.canvas_obj.getContext( "2d" );
			 var _radius = safe_int( arguments[1], 1 );
			 var _drawcolor = safe_int( arguments[2], "" );
			 var _fillcolor = safe_int( arguments[3], "orange" );
			 _ctx.beginPath() ;
			 _ctx.arc( _pt.x, _pt.y, _radius, 0, 2 * Math.PI, false);
			 if ( _drawcolor.length > 0 )
			 {
			 	  _ctx.strokeStyle = _drawcolor ;
		 	    _ctx.stroke();
			 }
			 if ( _fillcolor.length > 0 )
			 {
				  _ctx.fillStyle = _fillcolor ;
		 	    _ctx.fill();
			 }
			  
       _ctx.closePath() ;
		}
		else
    {
       this.log_add( "Can't draw point: missing input canvas obj" );
       this.err_no = _POLYGON_ERR_MISSING_CANVAS_OBJ_REF ;
       return 0 ;
    }
}

polygon.prototype.midpoint = function()
{
    var _n_pts = this.vertex_array.length ;
    if ( _n_pts > 0 )
    {
    	 var _prev_pt, _curr_pt ;
    	 var _pts = this.vertex_array.clone();
    	 		 _pts.push( this.vertex_array[0] ) ; // last midpoint between index _n and 0
    	 		 _n_pts = _pts.length ;
    	 var _mid_pts = [] ;
    	 for( var _i = 1 ; _i < _n_pts ; _i++ ) _mid_pts.push( _pts[ _i ].midpoint( _pts[_i-1] ) );
	 		 return ( _mid_pts.length > 0 ) ? new polygon( _mid_pts ) : null ;
    }
    else return null ;
}

polygon.prototype.draw = function( _drawcolor, _fillcolor, _linewidth, _remap_to_canvas )
{
    _remap_to_canvas = safe_int( _remap_to_canvas, 0 ); // should remap points according to canvas size
    _linewidth = safe_int( _linewidth, 1 );
    _drawcolor = safe_string( _drawcolor, "" );
    _fillcolor = safe_string( _fillcolor, "" );
    if ( is_html_canvas( this.canvas_obj ) )
    {
       var _canvas = this.canvas_obj, _pt ;
       if ( _remap_to_canvas )
       {
           var _cW = _canvas.width, _cH = _canvas.height ;
       }
         
       var _n_pts = this.vertex_array.length ;
       if ( _n_pts > 0 )
       {
       		 var _vertex_array = this.vertex_array.clone() ;
       		 		 _vertex_array.push( _vertex_array[0] );
       		 var _ctx = _canvas.getContext( "2d" );
       		 _ctx.beginPath();
       		 _ctx.moveTo( _vertex_array[0].x, _vertex_array[0].y );
		       for( var _p = 0 ; _p < _vertex_array.length ; _p++ ) _ctx.lineTo( _vertex_array[_p].x, _vertex_array[_p].y );

					 if ( _fillcolor.length > 0 )
					 {
							 _ctx.fillStyle = _fillcolor ;
							 _ctx.fill();
					 }

					 if ( _drawcolor.length > 0 )
					 {
							 _ctx.lineWidth = _linewidth ;
							 _ctx.strokeStyle = _drawcolor ;
							 _ctx.stroke();
					 }

       		 _ctx.closePath();
			 }
         
       // draw the canvas
       this.err_no = _POLYGON_ERR_NONE ;
       return 1 ;
    }
    else
    {
       this.log_add( "Can't draw point: missing input canvas obj" );
       this.err_no = _POLYGON_ERR_MISSING_CANVAS_OBJ_REF ;
       return 0 ;
    }
}

polygon.prototype.smallest_circle = function( _drawcolor, _fillcolor, _linewidth )
{
    if ( !this.is_regular() ) return null ;
    
    _drawcolor = safe_string( _drawcolor, "" );
    _fillcolor = safe_string( _fillcolor, "" );
    _linewidth = safe_int( _linewidth, 0 );
    var _plot = _drawcolor.length > 0 || _fillcolor.length > 0 ? 1 : 0 ;
    if ( _plot && _linewidth == 0 ) _linewidth = 1 ;
    // computes the smallest circle enclosing all vertexes
    var _n_pts = this.vertex_array.length ;
    var _vertexes = this.vertex_array ;
    if ( _n_pts > 0 )
    {
    	 if ( _n_pts == 2 )
    	 {
				 	var _center = this.vertex_array[0].midpoint( this.vertex_array[1] );
				 	var _radius = this.vertex_array[0].distance( this.vertex_array[1] );
				 	return new circle( _center, _radius );
			 }
			 else if ( _n_pts == 3 ) return circle_from_triplet( this.vertex_array[0], this.vertex_array[1], this.vertex_array[2], 6, 1 );
			 else
			 {
				 	var _A = this.vertex_array.clone();
				 	var _B = _A.subset(3) ;
				 	var _D = circle_from_triplet( _B[0], _B[1], _B[2], 6, 1 ) ;
				 			_A = _A.slice( 3 );
				 	var _index = 0, _P, _M, _N, _distance = 0, _test_distance ;
				 	while( _A.length > 0 )
				 	{
				 		 _index = _distance = 0 ;
				 		 while( _index < _A.length )
				 		 {
				 	 		 _test_distance = _B[_index].distance( _A[_index] ) ;
		 			 		 if ( _distance == 0 || _test_distance > _distance )
		 			 		 {
		 					 		 _distance = _test_distance ;
									 _P = _B[_index] ;
							 }
		 			 		 _index++ ;
						 }
									 
						 _M = _P.midpoint( _A[_index] );
						 _B.push( _A[_index] );
						 _A.remove( _index, _index );

				 		 _index = _distance = 0 ;
				 		 while( _index < _B.length )
				 		 {
				 		 		 _test_distance = _B[_index].distance( _M ) ;
		 				 		 if ( _distance == 0 || _test_distance > _distance )
		 				 		 {
		 			 		 		 _distance = _test_distance ;
									 _N = _B[_index] ;
								 }
		 				 		 _index++ ;
						 }
								 
						 _D.center.x = _M.x, _D.center.y = _M.y, _D.radius = _M.distance( _N );
					}
			 }
    		 /*
         var _p = 0, _max_left = 0, _max_top = 0, _max_right = 0, _max_bottom = 0 ;
         // calculate the minimal rect enclosing all vertexes
         for( _p = 0 ; _p < _n_pts ; _p++ )
         {
              _max_left = _max_left == 0 ? _vertexes[_p].x : Math.min( _vertexes[_p].x, _max_left );
              _max_right = _max_right == 0 ? _vertexes[_p].x : Math.max( _vertexes[_p].x, _max_right );
              _max_top = _max_top == 0 ? _vertexes[_p].y : Math.max( _vertexes[_p].y, _max_top );
              _max_bottom = _max_bottom == 0 ? _vertexes[_p].y : Math.min( _vertexes[_p].y, _max_bottom );
         }
         
         // compute center of the resulting minimal rect, i.e. the mid point
         var _rect_center = new point( ( _max_left + _max_right ) / 2, ( _max_top + _max_bottom ) / 2 );
         // compute maximal distance of vertexes from rect center
         var _max_radius = 0 ;
         for( _p = 0 ; _p < _n_pts ; _p++ ) _max_radius = Math.max( _max_radius, _rect_center.distance( _vertexes[_p] ) ) ;
         
         if ( _plot )
         {
         		 var _ctx = this.canvas_obj.getContext( "2d" );
             _ctx.beginPath();
             _ctx.arc( _rect_center.x, _rect_center.y, _max_radius, 0, 2.0 * Math.PI, false );
             _ctx.lineWidth = _linewidth ;
             if ( _fillcolor.length > 0 )
             {
                 _ctx.fillStyle = _fillcolor ;
                 _ctx.fill();
             }
             if ( _drawcolor.length > 0 )
             {
                 _ctx.strokeStyle = _drawcolor ;
                 _ctx.stroke();
             }
         }
         */

       return _max_radius == 0 ? null : new circle( _rect_center, _max_radius ) ;
    }
    else return null ;
}

polygon.prototype.get_minimal_rect_container = function()
{
    if ( this.err_no == _POLYGON_ERR_NONE || !is_array( this.vertex_array ) )
    {
       if ( this.vertex_array.length == 0 ) return null ;
       var _left = null, _top = null, _right = null, _bottom = null, _pt ;
       for( var _i = 0 ; _i < this.vertex_array.length ; _i++ )
       {
          _pt = this.vertex_array[_i] ;
          if ( _left == null || _pt.x < _left ) _left = _pt.x ;
          if ( _right == null || _pt.x > _right ) _right = _pt.x ;
          if ( _top == null || _pt.y > _top ) _top = _pt.y ;
          if ( _bottom == null || _pt.y < _bottom ) _bottom = _pt.y ;
       }
         
       return [ _left, _top, _right, _bottom ] ;
    }
    else
    {
       this.log_add( "Fail to get minimal rect container due to error previously collected" );
       this.err_no = _POLYGON_ERR_PREVIOUS_ERROR ;
       return null ;
    }
}