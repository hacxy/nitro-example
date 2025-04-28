export const useUser = () => {
  const event = useEvent()
  // @ts-ignore
  return event.node.req.user
}
