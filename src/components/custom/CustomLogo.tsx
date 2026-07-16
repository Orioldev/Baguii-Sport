


interface Props {
    subtitle?: string;
}


export const CustomLogo = ({ subtitle = 'Sport' }: Props) => {
  return (
    <div className="flex items-center whitespace-nowrap justify-center">
        <span className="font-bold text-xl m-0 whitespace-nowrap text-gray-600">
            Baguii |
        </span>
        <p className="text-muted-foreground m-0 px-2 whitespace-nowrap">
            { subtitle }
        </p>
    </div>
  )
}
