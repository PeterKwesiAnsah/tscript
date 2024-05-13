import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { defaultCompilerTypeCheckingOptions } from "@/util/constants/tsconfig";
import { PencilIcon } from "lucide-react";
import { FormEvent } from "react";


const AuthorConfig = () => {
  const onChange = (e: FormEvent<HTMLInputElement>) => {
    const el = (e?.target as HTMLInputElement)
    console.log('el', el)
    if (el) {
      console.log({ name: el.name, value: el.value })
    }
  }
  return (
    <div>
      <Dialog >
        <DialogTrigger> <Button variant={'link'}>
          <PencilIcon className="w-4 h-4 mr-2" />
          Edit tsconfig.json
        </Button></DialogTrigger>
        <DialogContent className="max-w-screen-xl rounded-lg">
          <DialogHeader>
            <DialogTitle>Edit tsconfig.json</DialogTitle>
            <DialogDescription>
              If your changes don't take effect immediately, please refresh and try again
            </DialogDescription>
          </DialogHeader>
          <div className="w-[80vw] max-h-[80vh] overflow-y-auto">
            <div className="grid grid-cols-3 gap-4 px-8">
              {
                defaultCompilerTypeCheckingOptions?.filter(item => typeof item.value === 'boolean').map((item) => (
                  <div className="flex space-x-2 items-start" key={item.name}>
                    <div>
                      <input type="checkbox" name={item.name}  onChange={onChange} />

                    </div>
                    <div>
                      <p className="font-bold">
                        {item.name}
                      </p>
                      <p className="w-4/5 text-sm italic opacity-50">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}

export default AuthorConfig;
