export type configOption ={
  name:string;
  options?:string[]
  description?:string
  value:string|boolean
}


export type tsConfigOptions = configOption[]
