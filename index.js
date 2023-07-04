window.addEventListener("DOMContentLoaded", async () => {
    const canvasContainer = document.getElementById("glcanvas-container")
    const canvas = document.getElementById("glcanvas")

    function setCanvasSize() {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
    }

    setCanvasSize()
    window.addEventListener("resize", () => setCanvasSize())

    const gl = canvas.getContext("webgl")
    if(!gl) {
        canvasContainer.innerHTML = "Unable to create WebGL context"
        return
    }


    async function createShaderProgram() {
        //const url = "http://192.168.50.23:8000"
        const url = "https://vereena.gay"
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


    const u_size = gl.getUniformLocation(program, "size")
    const u_time = gl.getUniformLocation(program, "time")

    gl.useProgram(program)

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