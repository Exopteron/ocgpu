#define X_SCALE_FACTOR 1.566



-- Gl context. The root of graphics.
local GlContext = {


    -- Create a new GL context.
    new = function(self) 
        return setmetatable({}, {__index = self})
    end,


    -- Allocate a new vertex buffer.
    allocateVertexBuffer = function(self, data, elementSize)
        return VertexBuffer:new(self, data, elementSize)
    end,


    -- Unbind the buffer at index `index`.
    unbindBuffer = function(self, index)
        self.vertexBufferBindings[index] = nil
    end,


    -- Bind a buffer to index `index`.
    bindBuffer = function(self, buffer, index)
        self.vertexBufferBindings[index] = buffer
    end,

    -- Set the bound shader program.
    bindShader = function(self, program)
        self.shaderProgram = program
    end,

    drawArrays = function(self, first, count)
        if self.shaderProgram ~= nil then
            local vertexShader = self.shaderProgram.shaders[VERTEX_SHADER]

            local triangles = {}

            local triBuf = {}
            local vsBuf = {}
            for index = first, count do
                local argTable = {}
                for k, v in pairs(self.vertexBufferBindings) do
                    argTable[k] = deepcopy(v.data[index])
                end
                local out, vsout = vertexShader.shaderFn(argTable)
                local w, h = gpuRes()
                if #out >= 4 then
                    out[1] = out[1] / out[4]
                    out[2] = out[2] / out[4]
                    out[3] = out[3] / out[4]
                    out[4] = 1
                end
                out[2] = out[2] / X_SCALE_FACTOR
                -- X coordinate scaled (space character height)
                out[1] = w - (out[1] + 1) * w * 0.5
                -- Y coordinate negated
                out[2] = h - (1 - out[2]) * h * 0.5

                --print("Returned a Vec" .. #out)
                table.insert(triBuf, deepcopy(out))
                table.insert(vsBuf, deepcopy(vsout))
                if #triBuf == 3 and #vsBuf == 3 then
                    table.insert(triangles, {triBuf, vsBuf, #out})
                    triBuf = {}
                    vsBuf = {}
                    --print("Th33 " .. #triangles)
                end
            end
            for _, triangle in ipairs(triangles) do
                local vecLen = triangle[3]
                local vsOut = triangle[2]
                local triangle = triangle[1]
                --print("Triangele")
                rasterizeBarycentric(self, deepcopy(triangle[1]), deepcopy(triangle[2]), deepcopy(triangle[3]), vsOut, vecLen)
            end
        else
            error("No shader bound")
        end
    end,
    enableCap = function(self, cap) 
        self.capabilities[cap] = true
    end,
    disableCap = function(self, cap)
        self.capabilities[cap] = nil
    end,
    gpuResolution = function(self) 
        return gpuRes()
    end,
    clearDepthBuffer = function(self)
        self.depthBuffer = {}
    end,
    prepareBuffers = function(self)
        if self.doubleBufferLoc ~= nil then
            GPU.freeBuffer(self.doubleBufferLoc)
        end
        self.doubleBufferLoc = GPU.allocateBuffer()
        GPU.setActiveBuffer(self.doubleBufferLoc)
    end,
    swapBuffers = function(self)
        GPU.bitblt()
        GPU.freeBuffer()
        GPU.setActiveBuffer(0)
    end,
    shaderProgram = nil,
    depthBuffer = {},
    vertexBufferBindings = {},
    capabilities = {}
}