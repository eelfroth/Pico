function Grid()
{
  this.el = document.createElement("canvas");

  this.tile = {w:15,h:20}

  this.cursor = {
    x:0,
    y:0,
    move: function(x,y){
      this.x += x;
      this.y -= y;
      this.x = clamp(this.x,0,pico.program.w-1);
      this.y = clamp(this.y,0,pico.program.h-1);
      pico.grid.update();
    },
    insert: function(key){
      var key = key.trim() == "" ? "." : key.toLowerCase();
      if(pico.program.glyphs.indexOf(key) < 0){ console.log(`Illegal rune:${key}`); return; }
      pico.program.add(this.x,this.y,key);
    },
    inspect: function(){
      return pico.program.glyph_at(this.x,this.y)
    }
  }

  this.install = function(host)
  {
    this.size = {width:this.tile.w*pico.program.size.h,height:this.tile.h*pico.program.size.v,ratio:0.75}
    this.el.width = this.size.width;
    this.el.height = this.size.height+this.tile.h;
    this.el.style.width = (this.size.width * this.size.ratio)+"px";
    this.el.style.height = (this.size.height * this.size.ratio)+"px";

    host.appendChild(this.el)
  }

  this.update = function()
  {
    this.clear();
    this.draw_program();
    this.draw_output();
  }

  this.draw_program = function()
  {
    var ports = this.find_ports();

    var y = 0;
    while(y < pico.program.h){
      var x = 0;
      while(x < pico.program.w){
        var styles = {
          is_cursor: pico.grid.is_cursor(x,y),
          is_port: ports[`${x}:${y}`]
        }
        this.draw_sprite(x,y,pico.program.glyph_at(x,y),styles);
        x += 1
      }
      y += 1;
    }
  }

  this.draw_output = function()
  {
    var x = 0;
    var s = pico.program.r.replace(/\./g," ").trim()

    while(x < s.length){
      var c = s.substr(x,1)
      this.draw_sprite(x,pico.program.size.v-1,c)
      x += 1
    }
  }

  this.is_cursor = function(x,y)
  {
    return this.cursor.x == x && this.cursor.y == y;
  }

  this.find_ports = function()
  {
    var h = {};

    for(id in pico.program.progs){
      var g = pico.program.progs[id]
      if(pico.program.is_locked(g.x,g.y)){ continue; }
      for(id in g.ports){
        var port = g.ports[id]
        h[`${g.x+port.x}:${g.y+port.y}`] = port.output ? 2 : port.bang ? 1 : 3
      }
    }
  
    return h;
  }

  this.context = function()
  {
    return this.el.getContext('2d');
  }

  this.clear = function()
  {
    var ctx = this.context();

    ctx.clearRect(0, 0, this.size.width, this.size.height);
  }

  this.draw_sprite = function(x,y,g,styles = {is_cursor: false,is_port: false})
  {
    var ctx          = this.context();

    ctx.textBaseline = 'bottom';
    ctx.textAlign    = "center"; 
    ctx.font         = `${this.tile.h*0.75}px input_mono_regular`;

    if(styles.is_cursor){
      ctx.fillStyle    = 'white';
      ctx.fillRect((x+0.5)*this.tile.w,(y)*this.tile.h,this.tile.w,this.tile.h);  
      ctx.fillStyle    = 'black';
    }
    else if(styles.is_port){
      if(styles.is_port == 2){
        ctx.fillStyle = '#72dec2'
        ctx.fillRect((x+0.5)*this.tile.w,(y)*this.tile.h,this.tile.w,this.tile.h);  
        ctx.fillStyle    = 'black';
      }
      else if(styles.is_port == 1){
        ctx.fillStyle = '#ffb545'
        ctx.fillRect((x+0.5)*this.tile.w,(y)*this.tile.h,this.tile.w,this.tile.h);  
        ctx.fillStyle    = 'black';
      }
      else if(styles.is_port == 3){
        ctx.fillStyle = '#444'
        ctx.fillRect((x+0.5)*this.tile.w,(y)*this.tile.h,this.tile.w,this.tile.h);  
        ctx.fillStyle    = 'white';
      }
    }
    else{
      ctx.fillStyle = 'white';
    }
    
    ctx.fillText(styles.is_cursor && g == "." ? "@" :g.toUpperCase(), (x+1) * this.tile.w, (y+1) * this.tile.h);
  }

  function clamp(v, min, max) { return v < min ? min : v > max ? max : v; }
}