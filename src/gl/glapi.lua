#include "enum.lua"
#include "../constants.lua"
#include "../maths.lua"
#include "../gpu/gpuapi.lua"
#include "../raster/rasterize.lua"
#include "buffer.lua"
#include "shader.lua"
#include "texture.lua"
#include "context.lua"
local exports = {
    context = GlContext,
    buffer = VertexBuffer,
    shaderProgram = ShaderProgram,
    shader = Shader,
    capabilities = Capabilities,
    texture2d = Texture2D
}

-- clearScreen()
-- local w, h = gpuRes()
-- rasterizeBarycentric(newVec2SS(0, 0), newVec2SS(10, 10), newVec2SS(0, 10))

return exports;