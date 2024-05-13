/**
 * model should like similar to 
 * {
 * propName:
 * value:
 * description
 * }[]
 * 
 * each property will be set to it's default value
 * on toggle/change, the store is updated and this may cause a rerender??
 * boolean values will be check boxes while others are selects
 * get the default tsconfig/ the possible values
 */
import { create } from 'zustand'
import { tsConfigOptions } from '../../components/configs/types';
import {defaultCompilerTypeCheckingOptions as defaultCompilerOptions} from '@/util/constants/tsconfig'

const configStore = create<{
  compilerOptions: tsConfigOptions;
  actions: {
    updateOption: (option: string, value: string | boolean) => void
  }
}>((set, store) => ({
  compilerOptions: defaultCompilerOptions,
  actions: {
    updateOption(option, value) {
      const index = defaultCompilerOptions.findIndex(item=>item.name === option)
      if(index){
        const clone  = [...store().compilerOptions]
        const item = clone.find((compilerOption)=>compilerOption.name = option)
        if(typeof item?.value === 'boolean'){
          clone[index] = {...item,value: !item?.value}
        } else {
          clone[index] = {...item,value}
        }
      }
    },
    resetOptions() {
      set({ compilerOptions: defaultCompilerOptions })
    }
  }
}))

export const useGetConfigs = ()=>configStore((store)=>store.compilerOptions?.reduce((acc,option)=>{
  acc[option.name] = option.value
  return acc;
},{}))
