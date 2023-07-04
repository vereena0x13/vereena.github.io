window.addEventListener("DOMContentLoaded", async () => {
    const canvas = document.getElementById("glcanvas")

    function setCanvasSize() {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
    }

    setCanvasSize()
    window.addEventListener("resize", () => setCanvasSize())


    const gl = canvas.getContext("webgl")
    if(!gl) return


    //console.log(gl.getParameter(gl.SHADING_LANGUAGE_VERSION))


    async function createShaderProgram() {
        const url = "http://localhost:8000"
        const vert = await (await fetch(`${url}/shaders/vert.glsl`)).text()
        const frag = await (await fetch(`${url}/shaders/frag.glsl`)).text()

        const vertexShader = gl.createShader(gl.VERTEX_SHADER)
        gl.shaderSource(vertexShader, vert)
        gl.compileShader(vertexShader)

        if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
            console.log("Error in vertex shader:")
            console.log(gl.getShaderInfoLog(vertexShader))
            return null
        }

        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
        gl.shaderSource(fragmentShader, frag)
        gl.compileShader(fragmentShader)

        if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
            console.log("Error in fragment shader:")
            console.log(gl.getShaderInfoLog(fragmentShader))
            return null
        }

        const program = gl.createProgram()
        gl.attachShader(program, vertexShader)
        gl.attachShader(program, fragmentShader)
        gl.linkProgram(program)
        gl.detachShader(program, vertexShader)
        gl.detachShader(program, fragmentShader)
        gl.deleteShader(vertexShader)
        gl.deleteShader(fragmentShader)

        if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.log(gl.getProgramInfoLog(program))
            return null
        }

        return program
    }

    const program = await createShaderProgram()
    if(program === null) return


    /*
    function createPalettesTexture(palettes) {
        const texture = gl.createTexture()
        gl.bindTexture(gl.TEXTURE_2D, texture)

        const height = palettes.length
        var width = 1
        for(var i = 0; i < height; i++) {
            const l = palettes[i].length
            if(l > width) width = l + 1
        }

        // NOTE TODO: OpenGL is fucking broken as shit. The correct number of bytes for
        // this texture is width * height * 3, because we are using 3 bytes per pixel.
        // However for some reason once I start adding more than one palette, OpenGL
        // gives an error saying that the data I'm passing to texImage2D isn't large
        // enough. So as a lazy hack to get it to work, We're giving it width * height * 4
        // bytes instead. Just means there's some extra 0s at the end of the buffer.
        // Stupid as fuck, but whatever; I don't want to spent more time on this.
        const rawData = new Array(width * height * 4).fill(0)
        for(var i = 0; i < height; i++) {
            const palette = palettes[i]
            const offset = i * width * 3

            const l = palette.length
            rawData[offset + 0] = l
            rawData[offset + 1] = l
            rawData[offset + 2] = l

            for(var j = 0; j < l; j++) {
                rawData[offset + 3 + (j * 3) + 0] = (palette[j] & 0xFF0000) >> 16
                rawData[offset + 3 + (j * 3) + 1] = (palette[j] & 0x00FF00) >> 8
                rawData[offset + 3 + (j * 3) + 2] =  palette[j] & 0x0000FF
            }
        }

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, width, height, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array(rawData))

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)

        return [texture, width, height]
    }
    */


    const vertices = new Float32Array([
        -1.0, -1.0, 
         1.0, -1.0, 
        -1.0,  1.0, 
        -1.0,  1.0, 
         1.0, -1.0, 
         1.0,  1.0
    ])
    const vbuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vbuffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

    const a_position = gl.getAttribLocation(program, "position")
    gl.enableVertexAttribArray(a_position)
    gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0)


    /*
    const [palettesTexture, palettesTextureWidth, palettesTextureHeight] = createPalettesTexture([
        [ 0x5BCEFA, 0xF5A9B8, 0xFFFFFF, 0xF5A9B8, 0x5BCEFA ],   // trans
        [ 0xFF218C, 0xFFD800, 0x21B1FF ],                       // pan
        [ 0xFF76A4, 0xFFFFFF, 0xC011D7, 0x000000, 0x2F3CBE ],   // genderfluid
        [ 0xFCF434, 0xFFFFFF, 0x9C59D1, 0x000000 ],             // nonbinary
        [ 0xD62900, 0xFF9B55, 0xFFFFFF, 0xD461A6, 0xA50062 ],   // lesbian
    ])
    */


    const u_size = gl.getUniformLocation(program, "size")
    const u_time = gl.getUniformLocation(program, "time")
    //const u_palettes = gl.getUniformLocation(program, "palettes")
    //const u_palettesSize = gl.getUniformLocation(program, "palettesSize")


    //gl.activeTexture(gl.TEXTURE0)
    //gl.bindTexture(gl.TEXTURE_2D, palettesTexture)

    gl.useProgram(program)
    //gl.uniform1i(u_palettes, 0)
    //gl.uniform2f(u_palettesSize, palettesTextureWidth, palettesTextureHeight)


    function render(time) {
        window.requestAnimationFrame(render)

        gl.viewport(0, 0, canvas.width, canvas.height)

        gl.clearColor(0.0, 0.0, 0.0, 0.0)
        gl.clear(gl.COLOR_BUFFER_BIT)

        gl.uniform2f(u_size, canvas.width, canvas.height)
        gl.uniform1f(u_time, time * 0.001)

        gl.drawArrays(gl.TRIANGLES, 0, 6)
    }

    render()
})