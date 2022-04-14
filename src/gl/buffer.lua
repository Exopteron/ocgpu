-- Vertex buffer object. Data passed to vertex shader
local VertexBuffer = {
    -- Should not be called manually. Created by context
    new = function(self, context, data, elementSize) 
        local t = setmetatable({}, {__index = self})
        t.elementSize = elementSize
        local outData = {} 
        local len = 1
        
        
        -- loop over all in data
        for _, v in ipairs(data) do
            
            if type(v) == "table" then
            
                -- if it's a vector, grab the vector parts
                for _, v2 in ipairs(v) do
                    outData[len] = v2
                    len = len + 1
                end
            
            elseif type(v) == "number" then
            
                -- otherwise, add the number
                outData[len] = v
                len = len + 1
            
            end
        end
        
        
        local data = outData
        t.data = {}
        
        if elementSize ~= 1 then
            local len = 1
            for i = 1, #data, elementSize do
                local chunk = table.pack(table.unpack(data, i, i + elementSize - 1))
                t.data[len] = chunk
                len = len + 1
            end
        else
            t.data = data
        end
        t.context = context
        return t;
    end,
    -- Bind this buffer to index `index`.
    bindBuffer = function(self, index)
        self.context:bindBuffer(index, self)
    end,
    -- Unbind the buffer at index `index` within this buffer's context.
    unbindBuffer = function(self, index)
        self.context:unbindBuffer(index)
    end
}