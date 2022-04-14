-- A shader.
local Shader = {
    new = function(self, callback, type)
        local t = setmetatable({}, {__index = self})
        t.shaderType = type
        t.shaderFn = callback
        return t
    end
}

-- A shader program.
local ShaderProgram = {
    new = function(self, shaders) 
        local t = setmetatable({}, {__index = self})
        t.shaders = {}
        for k, v in pairs(shaders) do
            t.shaders[v.shaderType] = v
        end
        return t
    end
}