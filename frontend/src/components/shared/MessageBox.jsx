import React from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { Input } from '../ui/input'
import { Button } from '../ui/button'

const MessageBox = ({message, setMessage, isDialogOpen, setIsDialogOpen, selectedAction, handleDialogSubmit}) => {
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedAction?.label || "Action"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Write a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleDialogSubmit}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  )
}

export default MessageBox