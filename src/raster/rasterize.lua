#define edgeFunction(a, b, c) (c[1] - a[1]) * (b[2] - a[2]) - (c[2] - a[2]) * (b[1] - a[1])

local function rasterize(v0, v1, v2) 
    local w, h = gpuRes()
    local area = edgeFunction(v0, v1, v2)
    for y = 1, h do
        for x = 1, w do
            local p = newVec2(x + 0.5, y + 0.5)
            local w0 = edgeFunction(v1, v2, p)
            local w1 = edgeFunction(v2, v0, p)
            local w2 = edgeFunction(v0, v1, p)

            if w0 >= 0 and w1 >= 0 and w1 >= 0 then
                w0 = w0 / area
                w1 = w1 / area
                w2 = w2 / area
                GPU.setBackground(0xFFFFFF)
                GPU.set(x, y, " ")
                GPU.setBackground(0x000000)
            end
        end
    end
end
#define HASH_LIT #
#define HASH() HASH_LIT

-- interpolate(inputA, inputB, inputC, poly, point) \
--     local w_v1 = (((poly[2][2] - poly[3][2]) * (point[1]- poly[3][1])) + (poly[3][1]- poly[2][1]) * (point[2] - poly[3][2])) / (((poly[2][2] - poly[3][2]) * (poly[1][1]- poly[3][1])) + ((poly[3][1]- poly[2][1]) * (poly[1][2] - poly[3][2]))) \
--     local w_v2 = (((poly[3][2] - poly[1][2]) * (point[1] - poly[3][1])) + ((poly[1][1] - poly[3][1]) * (point[2] - poly[3][2]))) / (((poly[2][2] - poly[3][2]) * (poly[1][1] - poly[3][1])) + ((poly[3][1] - poly[2][1]) * (poly[1][2] - poly[3][2]))) \
--     local w_v3 = 1 - w_v1 - w_v2 \ 
--     local output = {} \
--     for i = 1, HASH()inputA do \
--         local v = (w_v1 * input_a[i] + w_v2 * input_b[i] + w_v3 * input_c[i]) / (w_v1 + w_v2 + w_v3) \
--         table.insert(output, v) \
--     end \

    local function interpolate(input_a, input_b, input_c, poly, point) 
        local w_v1 = (((poly[2][2] - poly[3][2]) * (point[1]- poly[3][1])) + (poly[3][1]- poly[2][1]) * (point[2] - poly[3][2])) / (((poly[2][2] - poly[3][2]) * (poly[1][1]- poly[3][1])) + ((poly[3][1]- poly[2][1]) * (poly[1][2] - poly[3][2]))) 
        local w_v2 = (((poly[3][2] - poly[1][2]) * (point[1] - poly[3][1])) + ((poly[1][1] - poly[3][1]) * (point[2] - poly[3][2]))) / (((poly[2][2] - poly[3][2]) * (poly[1][1] - poly[3][1])) + ((poly[3][1] - poly[2][1]) * (poly[1][2] - poly[3][2]))) 
        local w_v3 = 1 - w_v1 - w_v2 
        local output = {}
        for i = 1, #input_a do 
            local v = (w_v1 * input_a[i] + w_v2 * input_b[i] + w_v3 * input_c[i]) / (w_v1 + w_v2 + w_v3) 
            table.insert(output, v) 
        end
        return output
    end 

local function toPlane(v1, v2, v3)
    local a = ((v2[2] - v1[2]) * (v3[3] - v1[3])) - ((v3[2] - v1[2]) * (v2[3] - v1[3]));
    local b = ((v2[3] - v1[3]) * (v3[1] - v1[1])) - ((v3[3] - v1[3]) * (v2[1] - v1[1]));
    local c = ((v2[1] - v1[1]) * (v3[2] - v1[2])) - ((v3[1] - v1[1]) * (v2[2] - v1[2]));
    local d = -((a * v1[1]) + (b * v1[2]) + (c * v1[3]));
    return a, b, c, d
end

local function rasterizeBarycentric(context, v1, v2, v3, vsout, vecLen) 
    -- for k, v in pairs(context.shaderProgram.shaders) do
    --     print("Key " .. k .. " value " .. tostring(v))
    -- end
    local doDepthTest = vecLen >= 3 and context.capabilities[Capabilities.GL_DEPTH_TEST]
    local fragmentShader = context.shaderProgram.shaders[FRAGMENT_SHADER]

    local w, h = gpuRes()

    local vs1 = newVec2(v2[1] - v1[1], v2[2] - v1[2])
    local vs2 = newVec2(v3[1] - v1[1], v3[2] - v1[2])
    local a, b, c, d = toPlane(deepcopy(v1), deepcopy(v2), deepcopy(v3))
    
    local maxX = math.floor(math.max(v1[1], math.max(v2[1], v3[1])) + 0.5)

    local minX = math.floor(math.min(v1[1], math.min(v2[1], v3[1])) + 0.5)

    local maxY = math.floor(math.max(v1[2], math.max(v2[2], v3[2])) + 0.5)

    local minY = math.floor(math.min(v1[2], math.min(v2[2], v3[2])) + 0.5)

    for x = minX, maxX do
        -- if x > w or x < 0 then
        --     goto continueouter
        -- end
        for y = minY, maxY do
            -- if y > h or y < 0 then
            --     goto continue
            -- end
            local q = newVec2(x - v1[1], y - v1[2])

            local s = crossProduct(q, vs2) / crossProduct(vs1, vs2)
            local t = crossProduct(vs1, q) / crossProduct(vs1, vs2);

            if s >= 0 and t >= 0 and s + t <= 1 then
                if doDepthTest then
                    local zValue = 0
                    if (c ~= 0) then
                        zValue = (-((a * x) + (b * y) + d)) / c
                    end
                    local dbValue = context.depthBuffer[(x * w) + y]
                    if dbValue == nil then
                        context.depthBuffer[(x * w) + y] = zValue
                    elseif zValue < dbValue then
                        -- print("IGNORED LOL")
                        goto loopend
                    end
                end
                local interpolated = {}
                for i = 1, #vsout[1] do
                    -- print("Doing round")
                    local t1 = {v1, v2, v3}
                    local t2 = {x, y}
                    local output = interpolate(vsout[1][i], vsout[2][i], vsout[3][i], t1, t2)
                    table.insert(interpolated, output)
                    -- print("Did round, len is " .. #interpolated)
                end
                local color = fragmentShader.shaderFn({v1, v2, v3}, interpolated)
                local red = denormalize(color[1], 0, 255)
                local green = denormalize(color[2], 0, 255)
                local blue = denormalize(color[3], 0, 255)
                GPU.setBackground(toRGB(red, green, blue))
                GPU.set(x, y, " ")
                GPU.setBackground(0x000000)
                ::loopend::
            end
            ::continue::
        end
        ::continueouter::
    end
end