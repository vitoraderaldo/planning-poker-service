export class VoterDto {  

    constructor(voter: VoterDto) {
        Object.assign(this, voter)
    }

    planningId: string
    userId: string
    value: number    
}
